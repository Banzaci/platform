import { getTenant } from "@/libs/tenant";
import PageRenderer from "../PageRenderer";

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
    return (
      <main className="mx-auto max-w-6xl px-6 py-20">
        <h1 className="text-3xl font-bold">
          Page not found
        </h1>
      </main>
    );
  }

  return <PageRenderer page={page} editable={true} />;
}