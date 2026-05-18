import fs from 'fs';
import path from 'path';
import type { Post } from './types';

interface ParsedFrontmatter {
  metadata: Record<string, string | string[]>;
  content: string;
}

/**
 * Parse frontmatter from markdown file
 * Expected format:
 * ---
 * title: Post Title
 * date: 2026-05-15
 * tags: tag1, tag2
 * ---
 * # Content starts here
 */
function parseFrontmatter(content: string): ParsedFrontmatter {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (!match) {
    return { metadata: {}, content };
  }

  const [, frontmatterStr, bodyContent] = match;
  const metadata: Record<string, string | string[]> = {};

  frontmatterStr.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      const value = valueParts.join(':').trim();
      if (key.trim() === 'tags') {
        metadata[key.trim()] = value.split(',').map(t => t.trim()).filter(t => t);
      } else {
        metadata[key.trim()] = value;
      }
    }
  });

  return { metadata, content: bodyContent.trim() };
}

/**
 * Calculate reading time in minutes
 */
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Format date as "15 May 2026"
 */
function formatDateShort(dateISO: string): string {
  const date = new Date(dateISO);
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Create a slug from title
 */
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Parse all blog posts from content directory.
 * Files without a date field (e.g. about.md, privacy.md) are skipped.
 */
function getAllPosts(contentDir: string): Post[] {
  const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md'));

  const getString = (metadata: Record<string, string | string[]>, key: string): string => {
    const val = metadata[key];
    return typeof val === 'string' ? val : '';
  };

  const posts = files.map((file): Post | null => {
    const filePath = path.join(contentDir, file);
    const rawContent = fs.readFileSync(filePath, 'utf-8');
    const { metadata, content } = parseFrontmatter(rawContent);

    const dateStr = metadata['date'];
    // Skip files without a date (like about.md, privacy.md)
    if (!dateStr || Array.isArray(dateStr)) {
      return null;
    }

    const titleStr = getString(metadata, 'title');
    const title = titleStr || file.replace('.md', '');
    const slug = createSlug(title);
    const minutes = calculateReadingTime(content);

    const date = new Date(dateStr);
    const dateISO = date.toISOString().split('T')[0];
    const dateFormatted = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const dateShort = formatDateShort(dateISO);

    return {
      slug,
      title,
      date: dateFormatted,
      dateShort,
      dateISO,
      readingTime: `${minutes} min read`,
      excerpt: getString(metadata, 'excerpt'),
      intro: getString(metadata, 'intro'),
      tags: Array.isArray(metadata['tags']) ? metadata['tags'] : [],
      category: getString(metadata, 'category'),
      author: getString(metadata, 'author'),
      profileImage: getString(metadata, 'profileImage'),
      content,
    };
  }).filter((post): post is Post => post !== null);

  // Sort by date, newest first
  return posts.sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime());
}

export {
  parseFrontmatter,
  calculateReadingTime,
  formatDateShort,
  createSlug,
  getAllPosts,
};
