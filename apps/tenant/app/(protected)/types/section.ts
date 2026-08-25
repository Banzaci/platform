import { SectionTheme } from "@/types";

export type LocalizedText = {
  en?: string;
};

export type ImagePosition = {
  x: number;
  y: number;
};

export type SectionImage = {
  url: string;
  file?: File;
  publicId?: string;
  position?: ImagePosition;
  deletePublicId?:string
};

export type ContentType = {
  heading?: LocalizedText;
  text?: LocalizedText;
  image?: SectionImage;
};

export type SectionType = {
  id: string;
  type: string;
  content: ContentType;
  layout: string | null;
  theme: SectionTheme;
};