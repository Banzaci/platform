import { getTenant } from "@/libs/tenant";
import AccommodationPageClient from "./AccommodationPageClient";

export default async function AccommodationPage() {
  const data = await getTenant();
  const pageConfig = data.pages.find(
    (page) => page.slug === "accommodation"
  );
  
  if (!pageConfig) {
    throw new Error("Accommodation page config not found");
  }
  console.log('START---------------------')
  console.log(data.tenant.theme)
  console.log('START---------------------')
  return (
    <AccommodationPageClient
      tenantId={data.tenant.id}
      globalTheme={data.tenant.theme}
      pageId={pageConfig.id}
      sections={pageConfig.sections}
    />
  );
}