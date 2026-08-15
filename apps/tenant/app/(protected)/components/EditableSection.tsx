"use client";

import { ReactNode } from "react";
import EditSection from "./editsection/EditSection";
import AddSection from "./editsection/AddSection";
import MoveSection from "./MoveSection";
import DeleteSection from "./DeleteSection";

type Props = {
  section: any;
  pageId: string;
  tenantId: string;
  sections: any[];
  children: ReactNode;
};

export default function EditableSection({
  section,
  pageId,
  tenantId,
  sections,
  children,
}: Props) {
  return (
    <div className="group relative">
      {children}

      <EditSection
        section={section}
        pageId={pageId}
        tenantId={tenantId}
        sections={sections}
      />
      <button
        type="button"
        className="absolute -bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-full bg-black px-4 py-2 text-sm text-white shadow-lg opacity-0 transition group-hover:opacity-100"
      >
        + Add section
      </button>
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
      <DeleteSection
        section={section}
        sections={sections}
        pageId={pageId}
        tenantId={tenantId}
      />
    </div>
  );
}