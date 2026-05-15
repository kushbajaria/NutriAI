import React from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { SubscriptionProvider, useSubscription } from './SubscriptionContext';
import { DataProvider, useData } from './DataContext';
import { UIProvider, useUI } from './UIContext';

// Composition wrapper — combines all contexts
export function AppProvider({ children }) {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <UIProvider>
          <DataProvider>
            {children}
          </DataProvider>
        </UIProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
}

// Backward-compatible hook — aggregates all contexts so existing screens
// can keep using `useApp()` without refactoring every import.
export const useApp = () => {
  const auth = useAuth();
  const sub  = useSubscription();
  const data = useData();
  const ui   = useUI();
  return { ...auth, ...sub, ...data, ...ui };
};
