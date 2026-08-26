/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import EditableSection from "@/app/(protected)/components/EditableSection";
import PropertyDetailsClient from "./PropertyDetailsClient";
import { CancellationPolicy, GlobalTheme, TenantFont } from "@/types";

type Props = {
  tenantId: string;
  propertyId: string;
  pageId: string;
  sections: any[];
  globalTheme: GlobalTheme;
  cancellationPolicy: CancellationPolicy
  fonts: TenantFont[]
}
export default function EditPropertyDetailsClient({
  tenantId,
  pageId,
  sections,
  globalTheme,
  cancellationPolicy,
  propertyId,
  fonts,
}: Props) {
    return (
      <>
        {sections.map((section) => {
          return (
            <EditableSection
              key={section.id}
              fonts={fonts}
              section={section}
              pageId={pageId}
              tenantId={tenantId}
              sections={sections}
            >
              <PropertyDetailsClient
                tenantId={tenantId}
                propertyId={propertyId}
                cancellationPolicy={cancellationPolicy}
                globalTheme={globalTheme}
              />
            </EditableSection>
          );
        })}
      </>
    );
  }