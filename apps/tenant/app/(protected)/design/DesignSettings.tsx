"use client";

import FontUpload from "../components/FontUpload";
import TenantFonts from "../components/TenantFonts";

export default function DesignSettings({
  tenantId,
}: {
  tenantId: string;
}) {
  
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <FontUpload tenantId={tenantId} />
      <TenantFonts tenantId={tenantId} />
    </main>
  );
}