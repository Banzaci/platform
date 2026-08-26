/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useParams } from "next/navigation";

import PageRenderer from "@/app/PageRenderer";
import PreviewNavigation from "./PreviewNavigation";
import { useAIPreview } from "../../context/AIPreviewProvider";

export default function PreviewPage() {
  const params = useParams<{slug?: string[]}>();
  const { preview } = useAIPreview();

  if (!preview) {
    return (
      <div className="p-8">
        No preview available
      </div>
    );
  }

  const slug = !params.slug?.length ? "index" : params.slug[0];
  const page = preview.pages.find((page: any) => page.slug === slug);

  if (!page) {
    return (
      <div className="p-8">
        Page not found
      </div>
    );
  }
  return (
    <div
      style={{
          minHeight: "100vh",
          backgroundColor: preview.theme.global.backgroundColor,
          color: preview.theme.global.textColor,
          fontFamily: preview.theme.global.fonts?.body ?? undefined,
        }}
    >
      <PreviewNavigation
        pages={preview.pages}
      />
      <PageRenderer
        page={page}
        globalTheme={preview.theme}
        fonts={[]}
        editable={false}
      />
    </div>
  );
}