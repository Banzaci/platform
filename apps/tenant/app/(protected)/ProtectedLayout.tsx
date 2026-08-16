"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@hotel/hooks";
import { Loader2 } from "lucide-react";
import { apiClient } from "@/libs/api";
import { TenantResponse } from "@/types";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
  tenant: TenantResponse;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isError, isLoading, data } = useAuth(apiClient);
  console.log("ProtectedLayout")
  useEffect(() => {
    if (isError) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isError, pathname, router]);

  if (isLoading || isError || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-slate-50">
      {children}
    </main>
  );
}