/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ReactNode } from "react";
import EditSection from "./editsection/EditSection";
import AddSection from "./editsection/AddSection";
import MoveSection from "./MoveSection";
import DeleteSection from "./DeleteSection";
import { useIsEditor } from "@/hooks/useIsEditor";

type Props = {
  section: any;
  pageId: string;
  sections: any[];
  children: ReactNode;
};

export default function EditableSection({
  section,
  pageId,
  sections,
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
            sections={sections}
          />
          <AddSection
            section={section}
            sections={sections}
            pageId={pageId}
          />
          <MoveSection
            section={section}
            sections={sections}
            pageId={pageId}
          />
        { !isPropertGrid && <DeleteSection
            section={section}
            sections={sections}
            pageId={pageId}
          />
        }
        </>)}
    </div>
  );
}