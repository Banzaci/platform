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

export type BasePrice = {
  id?: string;
  property_id?: string;
  daily_price: number;
  weekly_price: number | null;
  monthly_price: number | null;
};

export type PropertyImage = {
  url: string;
  publicId: string;
};

export type Property = {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  units: number;
  amenities: string[];
  images: PropertyImage[];
  is_open: boolean;
  base_price: BasePrice | null;
};


export type PricePeriod = {
  id: string;
  property_id: string;
  name: string;
  start_date: string;
  end_date: string;
  daily_price: number | null;
  weekly_price: number | null;
  monthly_price: number | null;
};