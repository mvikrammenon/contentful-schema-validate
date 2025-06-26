module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom', // Use jsdom for React component testing if needed, 'node' for pure logic
  moduleNameMapper: {
    // Handle module aliases (if you have them in tsconfig.json)
    // '^@components/(.*)$': '<rootDir>/src/components/$1',
    // '^@validators/(.*)$': '<rootDir>/src/validators/$1',
    // etc.
  },
  setupFilesAfterEnv: [
    // '<rootDir>/src/setupTests.ts' // if you have a setup file
  ],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  // Optionally, specify roots if your tests are not directly under src or a __tests__ folder
  // roots: ['<rootDir>/src'],
  testMatch: [
    '**/?(*.)+(spec|test).[jt]s?(x)' // Default pattern
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
