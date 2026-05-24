import fs from 'fs';
import path from 'path';
import type { Post, TemplateData } from './types';
import { getAllPosts } from './markdown-parser';

/**
 * Simple markdown to HTML converter.
 * Does NOT sanitize input — never pass untrusted content directly.
 * Excalidraw images are inlined as raw SVG, not referenced by src.
 */
function markdownToHtml(markdown: string): string {
  let html = markdown;

  // Headings
  html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');

  // Code blocks — escape HTML entities so tags inside code are never parsed by the browser
  html = html.replace(/```([\s\S]*?)```/g, (_match: string, code: string) => {
    const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<pre><code>${escaped}</code></pre>`;
  });

  // Inline code — same escaping for the same reason
  html = html.replace(/`([^`]+)`/g, (_match: string, code: string) => {
    const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<code>${escaped}</code>`;
  });

  // Excalidraw SVG — inline the file directly
  html = html.replace(/!\[excalidraw\]\(([^)]+)\)/g, (_match: string, filename: string) => {
    const svgPath = path.join(__dirname, '../web/assets/excalidraw', filename);
    try {
      const svgContent = fs.readFileSync(svgPath, 'utf-8')
        .replace(/\s+width="[^"]*"/, '')
        .replace(/\s+height="[^"]*"/, '');
      return `<figure class="excalidraw">${svgContent}</figure>`;
    } catch (e) {
      console.warn(`⚠️  Excalidraw file not found: ${filename}`);
      return `<p class="missing-figure">[Missing diagram: ${filename}]</p>`;
    }
  });

  // Images — jpg, png, gif, webp
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match: string, alt: string, filename: string) => {
    return `<figure class="article-image">
            <img src="/assets/images/${filename}" alt="${alt}">
            ${alt ? `<figcaption>${alt}</figcaption>` : ''}
        </figure>`;
  });

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Blockquotes
  html = html.replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>');

  /**
   * List wrapping: each contiguous block of list items gets its own wrapper element.
   * "Contiguous" means consecutive lines with no blank lines or other HTML between them —
   * two lists separated by a paragraph each become independent <ul>/<ol> elements.
   * Temporary data-list attributes mark item type before wrapping so the <ul> and <ol>
   * passes can't match each other's items (both produce bare <li> lines otherwise).
   */
  html = html.replace(/^\* (.*?)$/gm, '<li data-list="ul">$1</li>');
  html = html.replace(/^- (.*?)$/gm, '<li data-list="ul">$1</li>');
  html = html.replace(/^\d+\. (.*?)$/gm, '<li data-list="ol">$1</li>');

  html = html.replace(
    /(<li data-list="ul">[^\n]*<\/li>(?:\n<li data-list="ul">[^\n]*<\/li>)*)/g,
    (match) => '<ul>' + match.replace(/ data-list="ul"/g, '') + '</ul>'
  );
  html = html.replace(
    /(<li data-list="ol">[^\n]*<\/li>(?:\n<li data-list="ol">[^\n]*<\/li>)*)/g,
    (match) => '<ol>' + match.replace(/ data-list="ol"/g, '') + '</ol>'
  );

  // Paragraphs
  html = html.split('\n\n').map(para => {
    if (para.match(/^<[h|ul|ol|blockquote|pre]/)) {
      return para;
    }
    return para.trim() ? `<p>${para.trim()}</p>` : '';
  }).join('\n');

  return html;
}

/**
 * Template renderer — handles {{var}}, {{#if var}}...{{/if}}, {{#each arr}}...{{/each}}.
 * Keep these three cases clearly separated; see Known Quirks in CLAUDE.md.
 */
function renderTemplate(template: string, data: TemplateData): string {
  let result = template;

  // Handle simple variables {{var}}
  Object.keys(data).forEach(key => {
    const value = data[key];
    if (typeof value === 'string' || typeof value === 'number') {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }
  });

  // Handle {{#each array}}...{{/each}}
  result = result.replace(/{{#each\s+(\w+)}}([\s\S]*?){{\/each}}/g, (_match: string, arrayName: string, content: string) => {
    const arr = data[arrayName];
    if (!Array.isArray(arr)) return '';
    return arr.map(item => content.replace(/{{this}}/g, item)).join('');
  });

  // Handle {{#if var}}...{{/if}}
  result = result.replace(/{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g, (_match: string, varName: string, content: string) => {
    return data[varName] ? content : '';
  });

  return result;
}

/**
 * Ensure directory exists
 */
function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Generate homepage with list of all posts
 */
function generateHomepage(posts: Post[], templatesDir: string, outputDir: string): void {
  const baseTemplate = fs.readFileSync(path.join(templatesDir, 'base.html'), 'utf-8');
  const homepageTemplate = fs.readFileSync(path.join(templatesDir, 'homepage.html'), 'utf-8');
  const postCardTemplate = fs.readFileSync(path.join(templatesDir, 'post-card.html'), 'utf-8');

  const postCards = posts.map(post => {
    return renderTemplate(postCardTemplate, {
      slug: post.slug,
      title: post.title,
      date: post.date,
      dateShort: post.dateShort,
      dateISO: post.dateISO,
      readingTime: post.readingTime,
      excerpt: post.excerpt,
      intro: post.intro,
      tags: post.tags,
    });
  }).join('\n');

  const homepageContent = renderTemplate(homepageTemplate, { posts: postCards });

  const html = renderTemplate(baseTemplate, {
    title: 'My Blog',
    description: 'Thoughts on architecture, leadership, engineering, and humans in the loop.',
    content: homepageContent,
  });

  fs.writeFileSync(path.join(outputDir, 'index.html'), html);
}

/**
 * Generate individual article pages
 */
function generateArticles(posts: Post[], templatesDir: string, outputDir: string, siteUrl: string): void {
  const baseTemplate = fs.readFileSync(path.join(templatesDir, 'base.html'), 'utf-8');
  const articleTemplate = fs.readFileSync(path.join(templatesDir, 'article.html'), 'utf-8');

  ensureDir(path.join(outputDir, 'posts'));

  posts.forEach(post => {
    const htmlContent = markdownToHtml(post.content);

    const articleContent = renderTemplate(articleTemplate, {
      title: post.title,
      date: post.date,
      dateShort: post.dateShort,
      dateISO: post.dateISO,
      readingTime: post.readingTime,
      tags: post.tags,
      category: post.category,
      author: post.author,
      profileImage: post.profileImage,
      intro: post.intro,
      content: htmlContent,
    });

    const jsonLd = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.intro,
      author: { '@type': 'Person', name: post.author },
      datePublished: post.dateISO,
      url: `${siteUrl}/posts/${post.slug}/`,
    });

    const html = renderTemplate(baseTemplate, {
      title: `${post.title} | My Blog`,
      description: post.intro,
      canonicalUrl: `${siteUrl}/posts/${post.slug}/`,
      jsonLd,
      content: articleContent,
    });

    const postDir = path.join(outputDir, 'posts', post.slug);
    fs.mkdirSync(postDir, { recursive: true });
    fs.writeFileSync(path.join(postDir, 'index.html'), html);
  });
}

/**
 * Generate tag archive pages
 */
function generateTagPages(posts: Post[], templatesDir: string, outputDir: string): void {
  ensureDir(path.join(outputDir, 'tags'));

  const tagMap: Record<string, Post[] | undefined> = {};
  posts.forEach(post => {
    post.tags.forEach(tag => {
      const entry = tagMap[tag];
      if (entry) {
        entry.push(post);
      } else {
        tagMap[tag] = [post];
      }
    });
  });

  const baseTemplate = fs.readFileSync(path.join(templatesDir, 'base.html'), 'utf-8');
  const postCardTemplate = fs.readFileSync(path.join(templatesDir, 'post-card.html'), 'utf-8');

  Object.keys(tagMap).forEach(tag => {
    const tagPosts = tagMap[tag];
    if (!tagPosts) return;

    const postCards = tagPosts.map(post => {
      return renderTemplate(postCardTemplate, {
        slug: post.slug,
        title: post.title,
        date: post.date,
        dateShort: post.dateShort,
        dateISO: post.dateISO,
        readingTime: post.readingTime,
        excerpt: post.excerpt,
        intro: post.intro,
        tags: post.tags,
      });
    }).join('\n');

    const tagContent = `
            <section class="tag-archive">
                <h1>Posts tagged: ${tag}</h1>
                <div class="posts-list">
                    ${postCards}
                </div>
            </section>
        `;

    const html = renderTemplate(baseTemplate, {
      title: `${tag} | My Blog`,
      description: `Posts tagged: ${tag}`,
      content: tagContent,
    });

    fs.writeFileSync(path.join(outputDir, 'tags', `${tag}.html`), html);
  });
}

/**
 * Copy static assets (CSS, JS, images, icons, etc)
 */
function copyAssets(srcDir: string, outputDir: string): void {
  const files = fs.readdirSync(srcDir);

  files.forEach(file => {
    if (file.endsWith('.css') || file.endsWith('.js')) {
      const src = path.join(srcDir, file);
      const dest = path.join(outputDir, file);
      fs.copyFileSync(src, dest);
    }
  });
}

/**
 * Copy images and icons from assets folder
 */
function copyAssetsFolders(assetsDir: string, outputDir: string): void {
  if (!fs.existsSync(assetsDir)) {
    return;
  }

  const isIgnored = (name: string) => name === 'README.md';

  const items = fs.readdirSync(assetsDir);
  items.forEach(item => {
    if (isIgnored(item)) return;
    const src = path.join(assetsDir, item);
    const dest = path.join(outputDir, 'assets', item);
    const stats = fs.statSync(src);

    if (stats.isDirectory()) {
      fs.cpSync(src, dest, { recursive: true, filter: (s) => !isIgnored(path.basename(s)) });
    } else {
      ensureDir(path.dirname(dest));
      fs.copyFileSync(src, dest);
    }
  });
}

/**
 * Generate static pages (about, privacy, etc).
 * These files are identified by presence in pageFiles — they use page.html, not article.html,
 * and are excluded from post listings.
 */
function generatePages(contentDir: string, templatesDir: string, outputDir: string): void {
  const baseTemplate = fs.readFileSync(path.join(templatesDir, 'base.html'), 'utf-8');
  const pageTemplate = fs.readFileSync(path.join(templatesDir, 'page.html'), 'utf-8');

  const pageFiles = ['about.md', 'privacy.md'];

  pageFiles.forEach(file => {
    const filePath = path.join(contentDir, file);
    if (!fs.existsSync(filePath)) {
      return;
    }

    const content = fs.readFileSync(filePath, 'utf-8');

    const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    let title = 'Page';
    let description = '';
    let pageContent = content;

    if (match) {
      const [, frontmatterStr, bodyContent] = match;
      frontmatterStr.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (!key || valueParts.length === 0) return;
        const val = valueParts.join(':').trim();
        if (key.trim() === 'title') title = val;
        if (key.trim() === 'description') description = val;
      });
      pageContent = bodyContent.trim();
    }

    const htmlContent = markdownToHtml(pageContent);
    const slug = file.replace('.md', '');

    const pageHtml = renderTemplate(pageTemplate, { title, content: htmlContent });
    const html = renderTemplate(baseTemplate, {
      title: `${title} | My Blog`,
      description: description || title,
      content: pageHtml,
    });

    const pageDir = path.join(outputDir, slug);
    fs.mkdirSync(pageDir, { recursive: true });
    fs.writeFileSync(path.join(pageDir, 'index.html'), html);
  });
}

/**
 * Main build function — orchestrates all generation steps.
 */
function build(contentDir: string, templatesDir: string, outputDir: string, siteUrl: string): void {
  console.log('🔨 Building blog...');

  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true });
  }
  fs.mkdirSync(outputDir, { recursive: true });

  const posts = getAllPosts(contentDir);

  if (posts.length === 0) {
    console.log('⚠️  No blog posts found in content/ directory');
  } else {
    console.log(`📝 Found ${posts.length} post(s)`);
  }

  generateHomepage(posts, templatesDir, outputDir);
  generateArticles(posts, templatesDir, outputDir, siteUrl);
  generateTagPages(posts, templatesDir, outputDir);
  generatePages(contentDir, templatesDir, outputDir);
  copyAssets(templatesDir, outputDir);

  const assetsDir = path.join(templatesDir, 'assets');
  copyAssetsFolders(assetsDir, outputDir);

  console.log('✅ Build complete!');
  console.log(`📁 Output: ${outputDir}`);
}

export { build, renderTemplate, generateHomepage, generateArticles, generateTagPages };
