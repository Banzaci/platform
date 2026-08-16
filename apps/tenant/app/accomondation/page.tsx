import { getTenant } from "@/libs/tenant";
import PropertiesPageClient from "./PropertiesPageClient";
import EditableSection from "@/app/(protected)/components/EditableSection";

export default async function PropertiesPage() {
  const data = await getTenant();

  const pageConfig = data.pages.find(
    (page) => page.slug === "accomondation"
  );

  const section = pageConfig?.sections?.find(
    (section) => section.type === "property-grid"
  );

  if (!pageConfig || !section) {
    return (
      <PropertiesPageClient
        tenantId={data.tenant.id}
      />
    );
  }

  return (
    <EditableSection
      section={section}
      pageId={pageConfig.id}
      tenantId={data.tenant.id}
      sections={pageConfig.sections}
    >
      <PropertiesPageClient
        tenantId={data.tenant.id}
        content={section.content}
        theme={{
          ...data.tenant.theme,
          ...(section.theme ?? {}),
        }}
      />
    </EditableSection>
  );
}