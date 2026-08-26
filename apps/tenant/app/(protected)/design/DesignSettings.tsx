"use client";

import FontUpload from "../components/FontUpload";
import TenantFonts from "../components/TenantFonts";
import TenantLogoUpload from "../components/TenantLogoUpload";

export default function DesignSettings() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <TenantLogoUpload />
      <FontUpload />
      <TenantFonts />
    </main>
  );
}