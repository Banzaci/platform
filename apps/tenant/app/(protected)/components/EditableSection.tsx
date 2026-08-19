/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ReactNode } from "react";
import EditSection from "./editsection/EditSection";
import AddSection from "./editsection/AddSection";
import MoveSection from "./MoveSection";
import DeleteSection from "./DeleteSection";
import { useIsEditor } from "@/hooks/useIsEditor";
import { SectionTheme } from "@/types";

type Props = {
  section: any;
  pageId: string;
  tenantId: string;
  sections: any[];
  theme: SectionTheme;
  children: ReactNode;
};

export default function EditableSection({
  section,
  pageId,
  tenantId,
  sections,
  theme,
  children,
}: Props) {
  const isEditor = useIsEditor();
  const isPropertGrid = section.type === 'property-grid';
  return (
    <div className="group relative z-50">
      {children}
      { isEditor && (
        <>
        <EditSection
          section={section}
          pageId={pageId}
          tenantId={tenantId}
          sections={sections}
          theme={theme}
        />
        <AddSection
          section={section}
          sections={sections}
          pageId={pageId}
          tenantId={tenantId}
        />
        <MoveSection
          section={section}
          sections={sections}
          pageId={pageId}
          tenantId={tenantId}
        />
        { !isPropertGrid && <DeleteSection
            section={section}
            sections={sections}
            pageId={pageId}
            tenantId={tenantId}
          />
        }
        </>)}
    </div>
  );
}