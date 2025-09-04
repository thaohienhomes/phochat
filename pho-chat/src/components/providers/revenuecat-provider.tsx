"use client";

import React, { useEffect, useState, createContext, useContext } from 'react';
import { Purchases } from '@revenuecat/purchases-js';

const RevenueCatContext = createContext({});

export const useRevenueCat = () => useContext(RevenueCatContext);

export const RevenueCatProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (typeof window !== 'undefined') {
        const apiKey = process.env.NEXT_PUBLIC_REVENUECAT_API_KEY;
        if (!apiKey) return;
        const purchases = Purchases.configure({ apiKey, appUserId: 'web-user' });
        const offerings = await purchases.getOfferings();
        if (offerings.current) {
          setProducts(offerings.current.availablePackages as any[]);
        }
      }
    };
    init();
  }, []);

  useEffect(() => {
    const checkSubscription = async () => {
      const apiKey = process.env.NEXT_PUBLIC_REVENUECAT_API_KEY;
      if (!apiKey) return;
      const purchases = Purchases.configure({ apiKey, appUserId: 'web-user' });
      const info = await purchases.getCustomerInfo();
      const activeMap: any = info.entitlements.active || {};
      setIsPro(Boolean(activeMap['pro']?.isActive));
    };
    checkSubscription();
  }, [user]);

  const purchasePackage = async (pack: any) => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_REVENUECAT_API_KEY;
      if (!apiKey) return;
      const purchases = Purchases.configure({ apiKey, appUserId: 'web-user' });
      const result = await purchases.purchase({ rcPackage: pack });
      const activeMap: any = result.customerInfo.entitlements.active || {};
      if (activeMap['pro']?.isActive) {
        setIsPro(true);
      }
    } catch (e) {
      if (e && typeof e === 'object' && !(e as any).userCancelled) {
        console.log(e);
      }
    }
  };

  return (
    <RevenueCatContext.Provider value={{ products, isPro, purchasePackage }}>
      {children}
    </RevenueCatContext.Provider>
  );
};
