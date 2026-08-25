"use client";

import { useState } from "react";
import { useAuth } from "@hotel/hooks";
import { apiClient } from "@/libs/api";
import { GlobalTheme, TenantFont } from "@/types";
import ProtectedNavigation from "../ProtectedNavigation";
import GlobalEditor from "./GlobalEditor";

export default function EditorControls({ tenantId, globalTheme, fonts }: {
  tenantId: string;
  globalTheme: GlobalTheme;
  fonts: TenantFont[]
}) {
  const [hasToken] = useState(() => {
    return !!apiClient.getToken();
  });

  if (!hasToken) {
    return null;
  }
  return (
    <AuthenticatedEditorControls
      tenantId={tenantId}
      globalTheme={globalTheme}
      fonts={fonts}
    />
  );
}

function AuthenticatedEditorControls({
  tenantId,
  globalTheme,
  fonts,
}: {
  tenantId: string;
  globalTheme: GlobalTheme;
  fonts: TenantFont[]
}) {
  const { data, isLoading, isError } = useAuth(apiClient, "v1/auth/tenant/session");

  if (isLoading || isError || !data) {
    return null;
  }

  return (
    <>
      <ProtectedNavigation />
      <GlobalEditor
        tenantId={tenantId}
        globalTheme={globalTheme}
        fonts={fonts}
      />
    </>
  );
}