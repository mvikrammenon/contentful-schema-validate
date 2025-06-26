import { FieldExtensionSDK } from '@contentful/app-sdk';

export interface ContentfulAppSDK extends FieldExtensionSDK {
  // Add any custom app-specific SDK methods or properties here if needed
}

// You can define other Contentful related interfaces here if necessary
// For example, if you need to work with specific content type structures:
/*
export interface MyContentType {
  fields: {
    title: string;
    description: string;
    // ... other fields
  };
}
*/
