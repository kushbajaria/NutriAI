import React from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { DataProvider, useData } from './DataContext';
import { UIProvider, useUI } from './UIContext';

// Composition wrapper — combines all three contexts
export function AppProvider({ children }) {
  return (
    <AuthProvider>
      <UIProvider>
        <DataProvider>
          {children}
        </DataProvider>
      </UIProvider>
    </AuthProvider>
  );
}

// Backward-compatible hook — aggregates all contexts so existing screens
// can keep using `useApp()` without refactoring every import.
export const useApp = () => {
  const auth = useAuth();
  const data = useData();
  const ui   = useUI();
  return { ...auth, ...data, ...ui };
};
