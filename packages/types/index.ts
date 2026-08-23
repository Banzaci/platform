export type Tenant = {
  id: string;
  name: string;
  subdomain: string;
  deleted: boolean
  custom_domain?: string;
};

export type TenantResponse = {
  tenant: {
    id: string;
    name: string;
    subdomain: string;
    custom_domain: string | null;
    category: string | null;
    location: string | null;
    logo_url: string | null;
    short_description: string | null;
    latitude: number | null;
    longitude: number | null;

    theme: {
      backgroundColor: string;
      textColor: string;
      primaryColor: string;
      secondaryColor: string;
      fontFamily: string;
      headingFontFamily: string;
      fontSize: string;
    };

    cancellation_policy: {
      free_cancellation_days: number;
      partial_refund_hours: number;
      partial_refund_percent: number;
    };
  };

  pages: Page[];
};

export type Page = {
  id: string;
  tenant_id: string;
  slug: string;
  layout_variant: string;

  sections: PageSection[];

  theme: Record<string, unknown>;

  name: {
    en: string;
  };
};

export type PageSection = {
  id: string;
  type: string;

  content: {
    heading?: {
      en: string;
    };

    text?: {
      en: string;
    };

    image?: string;

    [key: string]: unknown;
  };

  layout: string | null;

  theme: Record<string, unknown>;
};