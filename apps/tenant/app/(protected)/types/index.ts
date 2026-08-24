import { SectionTheme } from "@/types";
import { PageSection } from "@hotel/types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL;
export const TOKEN_NAME = process.env.NEXT_PUBLIC_TOKEN_NAME;

export type AIUpdatePlan = {
  theme: SectionTheme | null;
  pages: AIPage[];
  knowledge: AIKnowledgeItem[];
};

export type AIPage = {
  name: string;
  slug: string;
  sections: PageSection[];
};

export type AIKnowledgeItem = {
  category: string;
  intent?: string | null;
  question: LocalizedText;
  answer: LocalizedText;
};

export type LocalizedText = {
  en: string;
};