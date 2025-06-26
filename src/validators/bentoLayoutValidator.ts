import { BentoLayout, CardEntry } from '../interfaces/BentoLayout';

export interface ValidationError {
  message: string;
  type: 'error' | 'warning'; // Or more specific error types
}

export function validateBentoLayout(
  bentoLayout: BentoLayout,
  cards: CardEntry[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  // 1. Check total number of entries
  if (cards.length !== bentoLayout.limits.totalEntries) {
    errors.push({
      message: `Expected ${bentoLayout.limits.totalEntries} cards, but found ${cards.length}.`,
      type: 'error',
    });
  }

  // 2. Check each card's position and type
  const positions = Object.values(bentoLayout.positions).sort(
    (a, b) => a.index - b.index
  );

  cards.forEach((card, index) => {
    const positionRule = positions.find(p => p.index === index);

    if (!positionRule) {
      errors.push({
        message: `Card at index ${index} does not have a corresponding position rule in bentoLayout.`,
        type: 'error',
      });
      return; // Skip further checks for this card if its position is not defined
    }

    const cardContentType = card.sys.contentType.sys.id;
    if (!positionRule.expectedTypes.includes(cardContentType)) {
      errors.push({
        message: `Card at index ${index} has type '${cardContentType}', but expected one of: ${positionRule.expectedTypes.join(
          ', '
        )}.`,
        type: 'error',
      });
    }
  });


  // 3. Check type limits
  const typeCounts: { [key: string]: number } = {};
  cards.forEach(card => {
    const cardContentType = card.sys.contentType.sys.id;
    typeCounts[cardContentType] = (typeCounts[cardContentType] || 0) + 1;
  });

  for (const type in bentoLayout.limits.typeLimits) {
    const limit = bentoLayout.limits.typeLimits[type];
    const count = typeCounts[type] || 0;
    if (count > limit) {
      errors.push({
        message: `Content type '${type}' exceeds its limit. Expected maximum ${limit}, but found ${count}.`,
        type: 'error',
      });
    }
  }

  // Ensure all cards have a valid position defined in bentoLayout
  // This is a more general check for cases where card length might be less than totalEntries
  // but some cards might still be in unconfigured positions if indices are sparse.
  if (cards.length > positions.length) {
      errors.push({
          message: `There are ${cards.length} cards, but only ${positions.length} positions are defined in the layout.`,
          type: 'error',
      });
  }


  return errors;
}
