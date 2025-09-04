/*
 Minimal smoke test to ensure RevenueCat provider initializes without throwing
 when NEXT_PUBLIC_REVENUECAT_API_KEY is set. This is a compile + runtime smoke
 using a mock window and Purchases.configure.
*/
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Purchases from @revenuecat/purchases-js
vi.mock("@revenuecat/purchases-js", () => {
  return {
    Purchases: {
      configure: vi.fn(() => ({
        getOfferings: vi.fn(async () => ({ current: { availablePackages: [] } })),
        getCustomerInfo: vi.fn(async () => ({ entitlements: { active: {} } })),
        purchase: vi.fn(async () => ({ customerInfo: { entitlements: { active: {} } } })),
      })),
    },
  };
});

// Import after mocks
import { RevenueCatProvider } from "./revenuecat-provider";
import React from "react";
import { render } from "@testing-library/react";

describe("RevenueCatProvider", () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    process.env = { ...OLD_ENV, NEXT_PUBLIC_REVENUECAT_API_KEY: "rc_test_key" };
  });

  it("renders without throwing and calls Purchases.configure", async () => {
    const { Purchases } = await import("@revenuecat/purchases-js");
    const el = React.createElement(RevenueCatProvider, { children: React.createElement("div") });
    render(el);
    expect(Purchases.configure).toHaveBeenCalled();
  });
});

