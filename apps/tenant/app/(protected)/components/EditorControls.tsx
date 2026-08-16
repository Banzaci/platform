"use client";

import { useState } from "react";
import { useAuth } from "@hotel/hooks";
import { apiClient } from "@/libs/api";
import { SectionTheme } from "@/types";
import ProtectedNavigation from "../ProtectedNavigation";
import GlobalEditor from "./GlobalEditor";

export default function EditorControls({
  tenantId,
  theme,
}: {
  tenantId: string;
  theme: SectionTheme;
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
      theme={theme}
    />
  );
}

function AuthenticatedEditorControls({
  tenantId,
  theme,
}: {
  tenantId: string;
  theme: SectionTheme;
}) {
  const { data, isLoading, isError } = useAuth(apiClient);

  if (isLoading || isError || !data) {
    return null;
  }

  return (
    <>
      <ProtectedNavigation />

      <GlobalEditor
        tenantId={tenantId}
        theme={theme}
      />
    </>
  );
}