"use client";

import { createContext, useContext, useState } from "react";

type LoaderContextType = {
  showLoader: () => void;
  hideLoader: () => void;
};

const LoaderContext = createContext<LoaderContextType | null>(null);

export function LoaderProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);

  function showLoader() {
    setLoading(true);
  }

  function hideLoader() {
    setLoading(false);
  }

  return (
    <LoaderContext.Provider value={{ showLoader, hideLoader }}>
      {children}

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white px-8 py-6 rounded-xl shadow-xl flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin"></div>
            <p className="text-sm text-gray-700 font-medium">Processing...</p>
          </div>
        </div>
      )}
    </LoaderContext.Provider>
  );
}

export function useLoader() {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error("useLoader must be used inside LoaderProvider");
  }
  return context;
}