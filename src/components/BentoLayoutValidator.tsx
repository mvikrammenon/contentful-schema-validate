import React, { useState, useEffect } from 'react';
import {
  Note,
  Spinner,
  Paragraph,
  List,
  ListItem,
  Card as FormaCard, // Renaming to avoid conflict with CardEntry
  Stack,
} from '@contentful/forma-36-react-components';
import { PlainClientAPI } from 'contentful-management'; // Using PlainClientAPI for type
import { Entry } from 'contentful'; // For Entry type

import { useSDK } from '@contentful/react-apps-toolkit';
import { ContentfulAppSDK } from '../interfaces/Contentful';
import { BentoLayout, CardEntry } from '../interfaces/BentoLayout';
import {
  validateBentoLayout,
  ValidationError,
} from '../validators/bentoLayoutValidator';

// Helper to safely parse JSON
const safeJsonParse = <T>(jsonString: string | undefined): T | null => {
  if (!jsonString) return null;
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return null;
  }
};

const BentoLayoutValidator: React.FC = () => {
  const sdk = useSDK<ContentfulAppSDK>();
  const [cards, setCards] = useState<CardEntry[]>([]);
  const [bentoLayout, setBentoLayout] = useState<BentoLayout | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorParsingLayout, setErrorParsingLayout] = useState<string | null>(
    null
  );

  useEffect(() => {
    sdk.window.startAutoResizer();
  }, [sdk.window]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setErrorParsingLayout(null);

      // 1. Get Bento Layout configuration
      // Assuming bentoLayout JSON is stored in app installation parameters
      // under a key 'bentoLayoutConfiguration'
      const appParameters = sdk.parameters.installation as any; // Cast to any for now
      const layoutJson = appParameters?.bentoLayoutConfiguration as string | undefined;

      if (!layoutJson) {
        setErrorParsingLayout(
          'Bento layout configuration not found in app parameters.'
        );
        setBentoLayout(null); // Ensure bentoLayout is null if config is missing
      } else {
        const parsedLayout = safeJsonParse<BentoLayout>(layoutJson);
        if (!parsedLayout) {
          setErrorParsingLayout(
            'Failed to parse Bento layout configuration. Please check the JSON format.'
          );
          setBentoLayout(null); // Ensure bentoLayout is null on parse error
        } else {
          setBentoLayout(parsedLayout);
        }
      }


      // 2. Get current field value (array of linked entries)
      const fieldValue = sdk.field.getValue();
      if (fieldValue && Array.isArray(fieldValue)) {
        // The field value is an array of links (e.g., { sys: { type: "Link", linkType: "Entry", id: "..." } })
        // We need to fetch the actual entries to get their content types.
        const cma = sdk.cma as PlainClientAPI; // Use PlainClientAPI
        try {
          const entryLinks = fieldValue as { sys: { id: string } }[];
          const fetchedCardsPromises = entryLinks.map(link => cma.entry.get({ entryId: link.sys.id }) as Promise<Entry>);
          const resolvedEntries = await Promise.all(fetchedCardsPromises);

          // Adapt fetched entries to CardEntry structure
          const adaptedCards: CardEntry[] = resolvedEntries.map(entry => ({
            sys: {
              id: entry.sys.id,
              contentType: {
                sys: {
                  id: entry.sys.contentType.sys.id,
                },
              },
            },
          }));
          setCards(adaptedCards);

        } catch (error) {
          console.error('Error fetching linked entries:', error);
          setCards([]); // Set to empty or handle error appropriately
           setErrorParsingLayout(
            'Error fetching linked card entries. See console for details.'
          );
        }
      } else {
        setCards([]); // No cards or invalid field value
      }

      setIsLoading(false);
    };

    loadData();

    // Subscribe to field value changes
    const unsubscribe = sdk.field.onValueChanged((newValue: any) => {
       if (newValue && Array.isArray(newValue)) {
        loadData(); // Reload data when field value changes
       } else {
        setCards([]);
       }
    });

    return () => unsubscribe();
  }, [sdk]);

  useEffect(() => {
    // Perform validation when bentoLayout or cards change
    if (bentoLayout && cards) { // cards can be an empty array
      const errors = validateBentoLayout(bentoLayout, cards);
      setValidationErrors(errors);
    } else if (!bentoLayout && !errorParsingLayout) {
      // If bentoLayout is null and there's no parsing error yet,
      // it might mean the config is missing but not yet reported as an error.
      // This state is handled by errorParsingLayout.
       setValidationErrors([]);
    } else {
      // If bentoLayout is null due to parsing error, clear previous validation errors
      setValidationErrors([]);
    }
  }, [bentoLayout, cards, errorParsingLayout]);

  if (isLoading) {
    return <Spinner />;
  }

  if (errorParsingLayout) {
    return (
      <Note noteType="negative" title="Configuration Error">
        {errorParsingLayout}
      </Note>
    );
  }

  if (!bentoLayout) {
     // This case should ideally be covered by errorParsingLayout,
     // but as a fallback:
    return (
      <Note noteType="warning" title="Configuration Missing">
        Bento layout configuration is not available. Cannot perform validation.
      </Note>
    );
  }

  return (
    <Stack flexDirection="column" spacing="spacingS" fullWidth>
      {validationErrors.length === 0 && (
        <Note noteType="positive">
          Bento layout is valid!
        </Note>
      )}
      {validationErrors.length > 0 && (
        <FormaCard testId="validation-errors-card">
          <Paragraph>
            <strong>Validation Issues:</strong>
          </Paragraph>
          <List>
            {validationErrors.map((error, index) => (
              <ListItem key={index}>
                <Note noteType={error.type === 'error' ? 'negative' : 'warning'}>
                  {error.message}
                </Note>
              </ListItem>
            ))}
          </List>
        </FormaCard>
      )}
       {/* Display current layout and cards for debugging/transparency */}
       {/* <details>
        <summary style={{cursor: "pointer", marginTop: "10px"}}>Debug Info (Layout & Cards)</summary>
        <pre style={{fontSize: "12px", backgroundColor: "#f0f0f0", padding: "10px", borderRadius: "4px"}}>
          <strong>Layout Config:</strong><br/>
          {JSON.stringify(bentoLayout, null, 2)}
          <br/><br/>
          <strong>Current Cards ({cards.length}):</strong><br/>
          {JSON.stringify(cards.map(c => ({id: c.sys.id, type: c.sys.contentType.sys.id})), null, 2)}
        </pre>
      </details> */}
    </Stack>
  );
};

export default BentoLayoutValidator;
