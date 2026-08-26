/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import EditableSection from "@/app/(protected)/components/EditableSection";
import PropertyDetailsClient from "./PropertyDetailsClient";
import { CancellationPolicy, GlobalTheme, TenantFont } from "@/types";
import { SectionType } from "@/app/(protected)/types/section";

type Props = {
  propertyId: string;
  pageId: string;
  sections: SectionType[];
  cancellationPolicy: CancellationPolicy
}
export default function EditPropertyDetailsClient({
  pageId,
  sections,
  cancellationPolicy,
  propertyId,
}: Props) {
    return (
      <>
        {sections.map((section: SectionType) => {
          return (
            <EditableSection
              key={section.id}
              section={section}
              pageId={pageId}
              sections={sections}
            >
              <PropertyDetailsClient
                propertyId={propertyId}
                cancellationPolicy={cancellationPolicy}
                section={section}
              />
            </EditableSection>
          );
        })}
      </>
    );
  }