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
    <header className="border-b border-gray-800 bg-gray-950 text-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-6">
        {/* Brand */}
        <Link
          href="/dashboard"
          className="rounded-lg px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-gray-800 hover:text-white"
        >
          Dashboard
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          <Link
            href="/properties"
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-gray-800 hover:text-white"
          >
            Properties
          </Link>

          <Link
            href="/knowledge"
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-gray-800 hover:text-white"
          >
            Knowledge
          </Link>
        </nav>

        {/* Account */}
        <div className="ml-auto">
          <button
            type="button"
            onClick={() => {
              apiClient.removeToken();
              window.location.href = "/login";
            }}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-400 transition hover:bg-gray-800 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}