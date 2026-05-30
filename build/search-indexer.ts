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
  }));

  const json = JSON.stringify(entries);
  fs.writeFileSync(path.join(outputDir, 'search-index.json'), json);
  console.log(`🔍 Search index: ${entries.length} entries (${Buffer.byteLength(json, 'utf-8')}B)`);
}
