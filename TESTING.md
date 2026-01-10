# Testing Guide

This project uses [Vitest](https://vitest.dev/) and [React Testing Library](https://testing-library.com/react) for automated testing.

## Setup

Install the testing dependencies:

```bash
npm install
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode (recommended for development)
```bash
npm test -- --watch
```

### Run tests with UI
```bash
npm run test:ui
```

### Run tests with coverage report
```bash
npm run test:coverage
```

## Test Structure

Tests are located in `__tests__` directories next to the code they test:

- `lib/hooks/__tests__/` - Tests for custom React hooks
- `lib/design/__tests__/` - Tests for design utilities
- `components/design/__tests__/` - Tests for design components

## Writing Tests

### Example Hook Test

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMyHook } from '../useMyHook';

describe('useMyHook', () => {
  it('should do something', () => {
    const { result } = renderHook(() => useMyHook());

    act(() => {
      result.current.doSomething();
    });

    expect(result.current.value).toBe('expected');
  });
});
```

### Example Component Test

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should handle click', () => {
    render(<MyComponent />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

## Test Coverage

Current test coverage includes:

- ✅ `useUndoRedo` hook - Undo/redo functionality
- ✅ `useKeyboardShortcuts` hook - Keyboard shortcut handling
- ✅ `saveLoad` utilities - Design save/load functionality
- ✅ `DebugPanel` component - Debug panel UI
- ✅ `PropertyPanel` component - Property editing UI

## Best Practices

1. **Test behavior, not implementation** - Focus on what the user experiences
2. **Use semantic queries** - Prefer `getByRole`, `getByLabelText` over `getByTestId`
3. **Keep tests simple** - One assertion per test when possible
4. **Mock external dependencies** - Mock APIs, localStorage, etc.
5. **Clean up** - Tests automatically clean up after themselves

## Continuous Integration

Tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: npm test -- --run

- name: Generate coverage
  run: npm run test:coverage
```

## Troubleshooting

### Tests fail with "Cannot find module"
Make sure all dependencies are installed: `npm install`

### Tests timeout
Increase timeout in `vitest.config.ts`:
```typescript
test: {
  testTimeout: 10000
}
```

### Mock not working
Check that mocks are defined before imports and use `vi.mock()` correctly.
