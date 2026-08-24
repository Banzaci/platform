"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import type { AIUpdatePlan } from "@/types";

type AIPreviewContextType = {
  preview: AIUpdatePlan | null;
  setPreview: (preview: AIUpdatePlan | null) => void;
  clearPreview: () => void;
};

const AIPreviewContext =
  createContext<AIPreviewContextType | null>(null);

const STORAGE_KEY = "ai-preview";

export function AIPreviewProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [preview, setPreviewState] =
    useState<AIUpdatePlan | null>(null);

  const [loaded, setLoaded] = useState(false);

  // Restore after refresh
  useEffect(() => {
    const stored =
      sessionStorage.getItem(STORAGE_KEY);

    if (stored) {
      try {
        setPreviewState(
          JSON.parse(stored)
        );
      } catch {
        sessionStorage.removeItem(
          STORAGE_KEY
        );
      }
    }

    setLoaded(true);
  }, []);

  function setPreview(
    preview: AIUpdatePlan | null
  ) {
    setPreviewState(preview);

    if (preview) {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(preview)
      );
    } else {
      sessionStorage.removeItem(
        STORAGE_KEY
      );
    }
  }

  function clearPreview() {
    setPreview(null);
  }

  return (
    <AIPreviewContext.Provider
      value={{
        preview,
        setPreview,
        clearPreview,
      }}
    >
      {loaded ? children : null}
    </AIPreviewContext.Provider>
  );
}

export function useAIPreview() {
  const context = useContext(
    AIPreviewContext
  );

  if (!context) {
    throw new Error(
      "useAIPreview must be used inside AIPreviewProvider"
    );
  }

  return context;
}