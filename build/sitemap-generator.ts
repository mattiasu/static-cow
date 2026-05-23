import fs from 'fs';
import path from 'path';
import type { Post } from './types';

export function generateSitemap(posts: Post[], outputDir: string, siteUrl: string): void {
  const today = new Date().toISOString().split('T')[0];
  const mostRecentDate = posts[0]?.dateISO ?? today;

  const staticUrls = [
    { loc: `${siteUrl}/`, lastmod: mostRecentDate, changefreq: 'weekly', priority: '1.0' },
    { loc: `${siteUrl}/about/`, lastmod: today, changefreq: 'yearly', priority: '0.5' },
    { loc: `${siteUrl}/privacy/`, lastmod: today, changefreq: 'yearly', priority: '0.3' },
  ];

  const postUrls = posts.map(post => ({
    loc: `${siteUrl}/posts/${post.slug}/`,
    lastmod: post.dateISO,
    changefreq: 'monthly',
    priority: '0.8',
  }));

  const urlEntries = [...staticUrls, ...postUrls]
    .map(({ loc, lastmod, changefreq, priority }) =>
      `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>\n`;

  fs.writeFileSync(path.join(outputDir, 'sitemap.xml'), xml);
  console.log(`🗺️  Sitemap: ${staticUrls.length + postUrls.length} URLs → dist/sitemap.xml`);
}
