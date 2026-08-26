import { cache } from "react";
import { headers } from "next/headers";
import { TenantResponse } from "@/types";

export const getTenant = cache(async () => {
  const headersList = await headers();

  const host =
    headersList.get("x-forwarded-host") ??
    headersList.get("host");

  if (!host) {
    throw new Error("Could not determine host");
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const response = await fetch(
    `${apiUrl}v1/tenants/resolve?host=${encodeURIComponent(host)}`,
    {
      cache: "no-store",
    }
  );
  
  const data: TenantResponse = await response.json() as TenantResponse;
  return data;
});