# STI Race Connect - Cypress Tests

This directory contains end-to-end tests for the STI Race Connect application using Cypress.

## Test Structure

- `cypress/e2e/events/event-management.cy.ts`: Tests for event creation and management
- `cypress/support/commands.ts`: Custom Cypress commands for common operations

## Running Tests

Make sure your application is running on `http://localhost:3000` before running tests.

```bash
# Start the application
npm run dev

# In another terminal, run the tests
npm run cypress:open  # Opens the Cypress Test Runner UI
npm run cypress:run   # Runs tests headlessly in the terminal
npm run test:e2e      # Alias for cypress:run
```

## Test Coverage

### Authentication

- Login functionality

### Event Management

- Event creation with validation
- Event updates
- Form validation

## Adding New Tests

1. Create new test files in the appropriate directory under `cypress/e2e/`
2. Add common operations as custom commands in `cypress/support/commands.ts`
3. Run tests to verify functionality

## Best Practices

1. Use selectors that are unlikely to change (IDs, specific text content)
2. Keep tests independent of each other
3. Clean up test data after tests when possible
4. Add appropriate assertions to verify expected behavior
