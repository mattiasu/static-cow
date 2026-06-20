import fs from 'fs';
import path from 'path';
import type { SearchEntry } from './types';

const SITE_URL = 'https://addy.se';
const OUTPUT = '/tmp/newsletter-preview.html';

// Mirrors buildEmailHtml in functions/api/notify-new.ts — keep in sync
function buildEmailHtml(post: SearchEntry): string {
  const postUrl = `${SITE_URL}/posts/${post.slug}/`;
  const heroImg = post.hero
    ? `<img src="${SITE_URL}/assets/images/${post.hero}" alt="${post.title}" style="width:100%;max-width:600px;height:auto;display:block;border-radius:4px;margin-bottom:24px;">`
    : '';
  return `<!DOCTYPE html>
<html lang="en">
<body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111;">
  ${heroImg}
  <h1 style="font-size:22px;margin-bottom:6px;">${post.title}</h1>
  <p style="color:#888;font-size:13px;margin-bottom:20px;">${post.date}</p>
  <p style="font-size:16px;line-height:1.6;margin-bottom:16px;">${post.intro}</p>
  ${post.firstParagraph ? `<p style="font-size:15px;line-height:1.6;color:#444;margin-bottom:24px;">${post.firstParagraph}</p>` : ''}
  <a href="${postUrl}" style="color:#2DC093;font-size:15px;">Read the full article →</a>
</body>
</html>`;
}

const indexPath = path.join(__dirname, '../dist/search-index.json');
if (!fs.existsSync(indexPath)) {
  console.error('dist/search-index.json not found — run npm run build first.');
  process.exit(1);
}

const entries = JSON.parse(fs.readFileSync(indexPath, 'utf-8')) as SearchEntry[];
if (entries.length === 0) {
  console.error('Search index is empty.');
  process.exit(1);
}

const latest = entries[0];
fs.writeFileSync(OUTPUT, buildEmailHtml(latest));
console.log(`✅  ${OUTPUT}`);
console.log(`    Post: "${latest.title}"`);
