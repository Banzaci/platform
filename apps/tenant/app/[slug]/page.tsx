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
  const tenant = await getTenant();
  const page = tenant.pages.find(
    (page: any) => page.slug === slug
  );

  if (!page) {
    notFound();
  }
  return <PageRenderer page={page} editable={true} />;
}