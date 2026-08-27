"use client";

import {
  createContext,
  useContext,
  useMemo,
} from "react";

import {
  GlobalTheme,
  TenantFont,
} from "@/types";

type SettingsContextValue = {
  tenantId: string;
  currency: string;
  globalTheme: GlobalTheme;
  fonts: TenantFont[];
};

const SettingsContext =
  createContext<SettingsContextValue | null>(null);

type SettingsProviderProps = {
  tenantId: string;
  currency: string;
  globalTheme: GlobalTheme;
  fonts: TenantFont[];
  children: React.ReactNode;
};

export function SettingsProvider({
  tenantId,
  currency,
  globalTheme,
  fonts,
  children,
}: SettingsProviderProps) {
  const value = useMemo(
    () => ({
      tenantId,
      currency,
      globalTheme,
      fonts,
    }),
    [
      tenantId,
      currency,
      globalTheme,
      fonts,
    ]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error(
      "useSettings must be used inside SettingsProvider"
    );
  }

  return context;
}