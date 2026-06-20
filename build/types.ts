export interface Post {
  slug: string;
  title: string;
  date: string;        // Human-readable e.g. "12 May 2025"
  dateShort: string;   // e.g. "May 2025"
  dateISO: string;     // e.g. "2025-05-12"
  readingTime: string; // e.g. "4 min read"
  excerpt: string;
  intro: string;
  tags: string[];
  category: string;
  author: string;
  profileImage: string;
  hero: string;
  content: string;     // Raw markdown body
}

export interface TemplateData {
  [key: string]: string | number | string[] | boolean | undefined;
}

export interface SearchEntry {
  slug: string;
  title: string;
  intro: string;
  tags: string[];
  date: string;
  content: string;
  hero: string;
  firstParagraph: string;
}
