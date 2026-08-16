"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/libs/api";
import { LoginForm } from "@hotel/ui";
import { useAuth } from "@hotel/hooks";

export default function LoginPage() {
  const router = useRouter();
  const { data, isLoading } = useAuth(apiClient);

  useEffect(() => {
    if (data) {
      router.replace("/dashboard");
    }
  }, [data, router]);

  if (isLoading || data) {
    return null;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold tracking-tight">
          Login to your account
        </h1>

        <LoginForm
          apiClient={apiClient}
          onSuccess={() => router.replace("/dashboard")}
        />
      </div>
    </main>
  );
}