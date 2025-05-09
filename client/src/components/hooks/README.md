# Component Hooks

This directory contains React hooks that are specifically tied to components.

## Usage Guidelines

- Place hooks that are used by multiple components here
- Name hooks with the `use` prefix (e.g., `useCardFlip.ts`)
- Include TypeScript types for all parameters and return values
- Add JSDoc comments to document the hook's purpose and usage

Example:

```typescript
/**
 * Hook to manage card flip animation state
 * @param initialState - Whether the card starts flipped
 * @returns Object containing flip state and toggle function
 */
export function useCardFlip(initialState = false) {
  const [isFlipped, setIsFlipped] = useState(initialState);
  
  const toggleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);
  
  return { isFlipped, toggleFlip };
}
```