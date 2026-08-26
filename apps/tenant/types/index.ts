/* eslint-disable @typescript-eslint/no-explicit-any */
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
  sections: any[];
  key: string
  name: {
    [key: string]: string
  }
};

export type NavigationTheme = {
  backgroundColor?: string;
  textColor?: string;
  hoverColor?: string;
  activeColor?: string;
  fontFamily?: string;
  fontSize?: string;
  height?: string;
  logoHeight?: string;
};

export type GlobalTheme = {
  global: {
    backgroundColor?: string;
    textColor?: string;
    primaryColor?: string;
    secondaryColor?: string;
  },
  dateSelector?: {
    backgroundColor?: string;
    textColor?: string;
    secondaryColor?: string;
    borderColor?: string;
    borderRadius?: string;
    selectedBackgroundColor?: string;
    selectedColor?: string;
    shadow?: "none" | "sm" | "md" | "lg";
    width?: "50%" | "100%";
  };
  card?: {
    backgroundColor?: string;
    textColor?: string;
    secondaryColor?: string;
    borderColor?: string;
    borderRadius?: string;
    padding?: string;
    shadow?: "none" | "sm" | "md" | "lg";
  };
  button?: {
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: string;
    width?: "30%" | "50%" | "75%" | "100%";
    text?: string;
    position?: "left" | "center" | "right";
  };
  image?: {
    aspectRatio?: string;
  };
  navigation?: NavigationTheme;
  fonts?: {
    body?: string;
    heading?: string;
  };
  layout?: {
    columns?: number;
    gap?: string;
  };
}

export type SectionTheme = {
    backgroundColor?: string;
    textColor?: string;
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    fontSize?: string;
    paddingTop?: string;
    paddingBottom?: string;
    headingFontFamily?: string;
};

export type CancellationPolicy = {
  free_cancellation_days: number;
  partial_refund_hours: number;
  partial_refund_percent: number;
};

export type TenantFont = {
  id: string;
  name: string;
  url: string;
  format: "woff2" | "woff";
};

export type TenantResponse = {
  tenant: {
    id: string;
    name: string;
    subdomain: string;
    custom_domain: string | null;
    category: string;
    location: string;
    currency: string;
    logo_url: string | null;
    short_description: string;
    theme: GlobalTheme;
    cancellation_policy: CancellationPolicy
  };
  fonts: TenantFont[];
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
  total_price: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  nights: number;
  units: number;
  amenities: string[];
  images: PropertyImage[];
  is_open: boolean;
  base_price: BasePrice | null;
  calendar_token: string;
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

export type TenantProperty = {
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
  is_available: boolean;
  base_price: BasePrice | null;
  nights?: number | null;
  total_price?: number | null;
  cancellation_policy?: {
    free_cancellation_days: number;
    partial_refund_hours: number;
    partial_refund_percent: number;
  };
};

export type PublicPaymentSettings = {
  online: boolean;
  pay_on_property: boolean;
  pay_withbank_transfer: boolean;

  bank_name: string | null;
  account_name: string | null;
  account_number: string | null;
  iban: string | null;
  swift: string | null;
  bank_instructions: string | null;
};

export type PublicPropertyResponse = {
  property: Property;
  payment_settings: PublicPaymentSettings;
};

export type PublicTenantPropertyResponse = {
  property: TenantProperty;
  payment_settings: PublicPaymentSettings;
};