"use client";

import { useSyncExternalStore } from "react";
import { apiClient } from "@/libs/api";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot() {
  return !!apiClient.getToken();
}

function getServerSnapshot() {
  return false;
}

export function useIsEditor() {
  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
}