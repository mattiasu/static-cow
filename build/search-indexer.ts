import fs from 'fs';
import path from 'path';
import type { Post, SearchEntry } from './types';

/**
 * Strips markdown syntax from a string, returning plain prose text suitable
 * for full-text indexing. Order matters: fenced blocks and excalidraw must
 * be removed first so their contents don't trigger later patterns.
 */
export function stripMarkdown(text: string): string {
  let result = text;

  // Fenced code blocks — drop entirely (code tokens are not useful for search)
  result = result.replace(/```[\s\S]*?```/g, '');

  // Excalidraw image tags — drop entirely, no prose value
  result = result.replace(/\?\[excalidraw\]\([^)]*\)/g, '');

  // Image tags — drop entirely
  result = result.replace(/!\[[^\]]*\]\([^)]*\)/g, '');

  // Links — keep the link text, drop the URL
  result = result.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');

  // Heading prefixes
  result = result.replace(/^#{1,6}\s+/gm, '');

  // Bold — must come before single-asterisk italic
  result = result.replace(/\*\*([^*]+)\*\*/g, '$1');
  result = result.replace(/__([^_]+)__/g, '$1');

  // Italic
  result = result.replace(/\*([^*]+)\*/g, '$1');
  result = result.replace(/_([^_]+)_/g, '$1');

  // Inline code — keep the content
  result = result.replace(/`([^`]+)`/g, '$1');

  // Blockquote prefixes
  result = result.replace(/^>\s*/gm, '');

  return result.replace(/\s+/g, ' ').trim();
}

/**
 * Extracts the first prose paragraph from raw markdown.
 * Skips headings, code blocks, images, lists, blockquotes, and excalidraw tags.
 */
export function extractFirstParagraph(content: string): string {
  const blocks = content.split(/\n\n+/);
  for (const block of blocks) {
    const trimmed = block.trim();
    if (
      !trimmed ||
      trimmed.startsWith('#') ||
      trimmed.startsWith('```') ||
      trimmed.startsWith('?[excalidraw]') ||
      trimmed.startsWith('![') ||
      trimmed.startsWith('* ') ||
      trimmed.startsWith('- ') ||
      /^\d+\. /.test(trimmed) ||
      trimmed.startsWith('>')
    ) continue;
    return stripMarkdown(trimmed);
  }
  return '';
}

/**
 * Writes dist/search-index.json from all posts.
 * Full content is included as stripped plain text for content-match scoring.
 */
export function generateSearchIndex(posts: Post[], outputDir: string): void {
  const entries: SearchEntry[] = posts.map(post => ({
    slug: post.slug,
    title: post.title,
    intro: post.intro,
    tags: post.tags,
    date: post.dateShort,
    content: stripMarkdown(post.content),
    hero: post.hero,
    firstParagraph: extractFirstParagraph(post.content),
  }));

  const json = JSON.stringify(entries);
  fs.writeFileSync(path.join(outputDir, 'search-index.json'), json);
  console.log(`🔍 Search index: ${entries.length} entries (${Buffer.byteLength(json, 'utf-8')}B)`);
}
