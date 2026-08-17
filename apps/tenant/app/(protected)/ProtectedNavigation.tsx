"use client";

import { useAuth } from "@hotel/hooks";
import { Loader2 } from "lucide-react";
import { apiClient } from "@/libs/api";
import Link from "next/link";

export default function ProtectedNavigation() {
  const { isError, isLoading, data } = useAuth(apiClient);
  if (isLoading || isError || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <header className="border-b bg-gray-900 text-gray-50">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <button
          onClick={() => {
            apiClient.removeToken();
            window.location.href = "/login";
          }}
          className="rounded-lg px-4 py-2 text-sm font-medium  hover:bg-gray-100"
        >
          Sign out
        </button>
        <Link
          href="/properties"
          className="text-sm font-semibold tracking-tight"
        >
          Property
        </Link>
      </div>
    </header>
  );
}