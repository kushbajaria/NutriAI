import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { useSubscription } from '../context/SubscriptionContext';

/**
 * Hook: returns a function that navigates to Paywall if not pro,
 * otherwise calls the provided callback.
 */
export function usePremiumGate() {
  const { isPro } = useSubscription();
  const navigation = useNavigation();

  return (onAccess) => {
    if (isPro) {
      onAccess();
    } else {
      navigation.navigate('Paywall');
    }
  };
}

/**
 * Component wrapper: renders children only if pro,
 * otherwise renders fallback (or nothing).
 */
export function PremiumGate({ children, fallback = null }) {
  const { isPro } = useSubscription();
  if (!isPro) return fallback;
  return children;
}
