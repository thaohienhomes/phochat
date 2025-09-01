"use client";

import React, { useEffect, useState, createContext, useContext } from 'react';
import Purchases, { PurchasesStoreProduct } from 'react-native-purchases';

const RevenueCatContext = createContext({});

export const useRevenueCat = () => useContext(RevenueCatContext);

export const RevenueCatProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (typeof window !== 'undefined') {
        Purchases.setDebugLogsEnabled(true);
        await Purchases.configure({ apiKey: process.env.NEXT_PUBLIC_REVENUECAT_API_KEY });

        const offerings = await Purchases.getOfferings();
        if (offerings.current) {
          setProducts(offerings.current.availablePackages);
        }
      }
    };
    init();
  }, []);

  useEffect(() => {
    const checkSubscription = async () => {
      const customerInfo = await Purchases.getCustomerInfo();
      setIsPro(customerInfo.entitlements.active.pro ? true : false);
    };
    checkSubscription();
  }, [user]);

  const purchasePackage = async (pack: PurchasesStoreProduct) => {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pack);
      if (customerInfo.entitlements.active.pro) {
        setIsPro(true);
      }
    } catch (e) {
      if (!e.userCancelled) {
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
