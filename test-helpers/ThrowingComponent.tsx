import React from 'react';

interface Props {
  shouldThrow: boolean;
  message?: string;
}

/**
 * A test component that throws an error during render when shouldThrow is true.
 * Used for testing ErrorBoundaries.
 */
export const ThrowingComponent: React.FC<Props> = ({ shouldThrow, message = 'Test render error' }) => {
  if (shouldThrow) {
    throw new Error(message);
  }
  return null;
};
