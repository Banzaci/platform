"use client";

import { useAuth } from "@hotel/hooks";
import { apiClient } from "@/libs/api";
import { Theme } from "@/types";
import ProtectedNavigation from "../ProtectedNavigation";
import GlobalEditor from "./GlobalEditor";


export default function EditorControls({
  tenantId,
  theme,
}: {
  tenantId: string;
  theme: Theme;
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