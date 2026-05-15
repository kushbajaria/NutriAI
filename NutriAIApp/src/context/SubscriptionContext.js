import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Purchases from 'react-native-purchases';
import { useAuth } from './AuthContext';
import { REVENUECAT_API_KEY, ENTITLEMENT_ID } from '../constants/subscription';

const SubscriptionContext = createContext(null);

export function SubscriptionProvider({ children }) {
  const { user } = useAuth();
  const [customerInfo, setCustomerInfo] = useState(null);
  const [offerings, setOfferings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setCustomerInfo(null);
      setOfferings(null);
      setLoading(false);
      return;
    }

    let listenerRemove;

    async function init() {
      try {
        Purchases.configure({ apiKey: REVENUECAT_API_KEY });
        await Purchases.logIn(user.uid);

        const info = await Purchases.getCustomerInfo();
        setCustomerInfo(info);

        const offeringsResult = await Purchases.getOfferings();
        setOfferings(offeringsResult.current);
      } catch (e) {
        console.warn('[Subscription] Init error:', e.message);
      } finally {
        setLoading(false);
      }
    }

    init();

    listenerRemove = Purchases.addCustomerInfoUpdateListener((info) => {
      setCustomerInfo(info);
    });

    return () => {
      if (listenerRemove) listenerRemove();
    };
  }, [user?.uid]);

  // Sign out from RevenueCat when user logs out
  useEffect(() => {
    if (!user) {
      Purchases.logOut().catch(() => {});
    }
  }, [user]);

  const isPro = customerInfo?.entitlements?.active?.[ENTITLEMENT_ID]?.isActive === true;
  const isTrialing = customerInfo?.entitlements?.active?.[ENTITLEMENT_ID]?.periodType === 'trial';
  const expiresAt = customerInfo?.entitlements?.active?.[ENTITLEMENT_ID]?.expirationDate
    ? new Date(customerInfo.entitlements.active[ENTITLEMENT_ID].expirationDate)
    : null;

  const purchase = useCallback(async (pkg) => {
    const result = await Purchases.purchasePackage(pkg);
    setCustomerInfo(result.customerInfo);
    return result;
  }, []);

  const restore = useCallback(async () => {
    const info = await Purchases.restorePurchases();
    setCustomerInfo(info);
    return info;
  }, []);

  return (
    <SubscriptionContext.Provider value={{
      isPro,
      isTrialing,
      expiresAt,
      offerings,
      loading,
      purchase,
      restore,
      customerInfo,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
}
