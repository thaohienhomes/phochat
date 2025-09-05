// Minimal RevenueCat types used in our UI code paths. Not exhaustive.
export type RcProductTitle = string | undefined;

export type RcPackage = {
  identifier: string;
  webBillingProduct?: { title?: RcProductTitle } | null;
  rcBillingProduct?: { title?: RcProductTitle } | null;
};

export type RcOfferings = {
  current?: { availablePackages?: RcPackage[] } | null;
};

export type RcEntitlement = { isActive?: boolean };
export type RcEntitlementsMap = Record<string, RcEntitlement>;

export function extractPackages(offerings: unknown): RcPackage[] {
  const cur = (offerings as RcOfferings | undefined)?.current;
  const arr = cur?.availablePackages;
  return Array.isArray(arr) ? arr : [];
}

export function isProFromEntitlements(activeMap: unknown): boolean {
  const map = (activeMap || {}) as RcEntitlementsMap;
  return Boolean(map["pro"]?.isActive);
}

