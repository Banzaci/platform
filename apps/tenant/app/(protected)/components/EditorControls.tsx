"use client";

import { useState } from "react";
import { useAuth } from "@hotel/hooks";
import { apiClient } from "@/libs/api";
import ProtectedNavigation from "../ProtectedNavigation";
import GlobalEditor from "./GlobalEditor";

export default function EditorControls() {
  const [hasToken] = useState(() => {
    return !!apiClient.getToken();
  });

  if (!hasToken) {
    return null;
  }
  return (
    <AuthenticatedEditorControls />
  );
}

function AuthenticatedEditorControls() {
  const { data, isLoading, isError } = useAuth(apiClient, "v1/auth/tenant/session");

  if (isLoading || isError || !data) {
    return null;
  }

  return (
    <>
      <ProtectedNavigation />
      <GlobalEditor />
    </>
  );
}