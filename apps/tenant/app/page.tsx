import { getTenant } from "@/libs/tenant";
import { notFound } from "next/navigation";
import PageRenderer from "./PageRenderer";

export default async function HomePage() {
  const data = await getTenant();
  const page = data.pages.find(
    (page) => page.slug === "index"
  );
  if (!page) {
    notFound();
  }
  console.log(data.tenant.theme)
  console.log('--------------------------')
  return <PageRenderer page={page} editable={true} globalTheme={data.tenant.theme} />;
}