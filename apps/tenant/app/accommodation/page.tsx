import { getTenant } from "@/libs/tenant";
import PageRenderer from "../PageRenderer";
import { notFound } from "next/navigation";

export default async function AccommodationPage() {
  const data = await getTenant();
  const page = data.pages.find(
    (page) => page.slug === "accommodation"
  );
  if (!page) {
    notFound();
  }
  return <PageRenderer
    page={page}
    editable={true}
  />;
}