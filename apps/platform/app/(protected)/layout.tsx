"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@hotel/hooks";
import { Loader2 } from "lucide-react";
import { apiClient } from "@/libs/api";
import Navigation from "./Navigation";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isError, isLoading, data } = useAuth(apiClient);

  useEffect(() => {
    if (isError) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isError, pathname, router]);

  if (isLoading || isError || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <main className="flex flex-col min-h-screen bg-slate-50">
      <Navigation />
      {children}
    </main>
  );
}