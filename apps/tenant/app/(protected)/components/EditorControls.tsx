"use client";

import { useState } from "react";
import { useAuth } from "@hotel/hooks";
import { apiClient } from "@/libs/api";
import { SectionTheme, TenantFont } from "@/types";
import ProtectedNavigation from "../ProtectedNavigation";
import GlobalEditor from "./GlobalEditor";

export default function EditorControls({
  tenantId,
  theme,
  fonts,
}: {
  tenantId: string;
  theme: SectionTheme;
  fonts: TenantFont[]
}) {
  const [hasToken] = useState(() => {
    return !!apiClient.getToken();
  });

  if (!hasToken) {
    return null;
  }
  console.log("EditorControls")
  return (
    <AuthenticatedEditorControls
      tenantId={tenantId}
      theme={theme}
      fonts={fonts}
    />
  );
}

function AuthenticatedEditorControls({
  tenantId,
  theme,
  fonts,
}: {
  tenantId: string;
  theme: SectionTheme;
  fonts: TenantFont[]
}) {
  const { data, isLoading, isError } = useAuth(apiClient, "v1/auth/tenant/session");

  if (isLoading || isError || !data) {
    return null;
  }

  console.log("AuthenticatedEditorControls")

  return (
    <>
      <ProtectedNavigation />
      <GlobalEditor
        tenantId={tenantId}
        theme={theme}
        fonts={fonts}
      />
    </>
  );
}