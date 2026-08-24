/* eslint-disable @typescript-eslint/no-explicit-any */
import { getTenant } from "@/libs/tenant";
import PageRenderer from "../PageRenderer";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getTenant();
  const page = data.pages.find(
    (page: any) => page.slug === slug
  );

  if (!page) {
    notFound();
  }
  return <PageRenderer
    page={page}
    editable={true}
    globalTheme={data.tenant.theme}
    fonts={data.fonts}
  />;
}