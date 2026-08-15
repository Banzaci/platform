export type Field = {
  id: string;
  type: string;
  label: string;
  value: unknown;
  columns?: number;
};

export type PageData = {
  id: string;
  tenant_id: string;
  slug: string;
  layout_variant: string;
  fields: Field[];
  theme: Record<string, unknown>;
};

export type Theme = {
  backgroundColor?: string;
  textColor?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  fontSize?: string;
  paddingTop?: string;
  paddingBottom?: string;
};

export type TenantResponse = {
  tenant: {
    id: string;
    name: string;
    subdomain: string;
    custom_domain: string | null;
    category: string;
    location: string;
    logo_url: string | null;
    short_description: string;
    theme: Theme;
  };
  pages: PageData[];
};
