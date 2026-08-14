export type Tenant = {
  id: string;
  name: string;
  subdomain: string;
  custom_domain?: string;
};

export interface Page {
  id: string;
  tenant_id: string;
  slug: string;
  layout_variant: string;
  sort_order: number;
  // fields: Field[];
  theme: Record<string, unknown>;
}