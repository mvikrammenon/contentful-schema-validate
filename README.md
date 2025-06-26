# contentful-schema-validate


This repository contains a Contentful App designed to validate linked references in an entry field based on a flexible JSON configuration. Here's a summary of its capabilities:

### Core Functionality:

Bento Layout Validation: The primary use case is to validate collections of linked content entries (referred to as "cards") against a specific layout definition. This is useful for complex UI patterns like Bento Grids, carousels, or structured promotional sections.
Configurable Rules: Validation rules are defined in a JSON object provided during the app's installation parameters. This JSON specifies:
positions: Rules for each card slot, including its index and an array of expectedTypes (allowed content type IDs).
limits: Overall constraints, such as the totalEntries expected and typeLimits (maximum count for specific content types across all cards).
Real-time Feedback: The validator runs directly within the Contentful entry editor, providing immediate visual feedback (success messages or specific error details) below the relevant field.
Automatic Re-validation: It automatically re-validates when the linked references in the configured field are changed.
Technical Details:

Contentful App SDK: Built using the Contentful App SDK (@contentful/app-sdk and @contentful/react-apps-toolkit) for integration with the Contentful UI and access to field data and app parameters.
React & TypeScript: The UI is built with React and the entire codebase is in TypeScript for type safety and maintainability.
f36 Components: Uses Contentful's Formations Design System (@contentful/f36-components) for a consistent look and feel within the Contentful interface.
Extensible Logic: The core validation function (validateBentoLayout) is modular and could be extended or adapted for other complex validation scenarios beyond the current Bento Layout rules.
Build & Deployment with App Scripts: Integrated with @contentful/app-scripts for standardized building, local development (with HTTPS), and deploying the app to Contentful (including CI/CD friendly options).
Key Benefits:

Ensures Content Integrity: Helps content editors adhere to predefined structures for complex layouts, reducing errors and ensuring consistency.
Improves Editor Experience: Provides clear, immediate feedback directly in the editing interface, making it easier to create valid content.
Flexible Configuration: Allows developers to define various layouts and validation rules without changing the app's core code, simply by updating the installation JSON.
Standardized Development: Leverages Contentful's recommended tools and libraries for app development.
