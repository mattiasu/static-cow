const fs = require('fs');
const path = require('path');
const { getAllPosts } = require('./markdown-parser');

/**
 * Simple markdown to HTML converter
 */
function markdownToHtml(markdown) {
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

    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Excalidraw SVG — inline the file directly
    html = html.replace(/!\[excalidraw\]\(([^)]+)\)/g, (match, filename) => {
        const svgPath = path.join(__dirname, '../assets/excalidraw', filename);
        try {
            const svgContent = fs.readFileSync(svgPath, 'utf-8');
            return `<figure class="excalidraw">${svgContent}</figure>`;
        } catch (e) {
            console.warn(`⚠️  Excalidraw file not found: ${filename}`);
            return `<p class="missing-figure">[Missing diagram: ${filename}]</p>`;
        }
    });

    // Images — jpg, png, gif, webp
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, filename) => {
        return `<figure class="article-image">
            <img src="/assets/images/${filename}" alt="${alt}">
            ${alt ? `<figcaption>${alt}</figcaption>` : ''}
        </figure>`;
    });

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Blockquotes
    html = html.replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>');

    // Lists (unordered)
    html = html.replace(/^\* (.*?)$/gm, '<li>$1</li>');
    html = html.replace(/^- (.*?)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Lists (ordered)
    html = html.replace(/^\d+\. (.*?)$/gm, '<li>$1</li>');

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
 * Simple template renderer - replaces {{var}} and {{#if var}}...{{/if}}
 */
function renderTemplate(template, data) {
    let result = template;

    // Handle simple variables {{var}}
    Object.keys(data).forEach(key => {
        const value = data[key];
        if (typeof value === 'string' || typeof value === 'number') {
            result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }
    });

    // Handle {{#each array}}...{{/each}}
    result = result.replace(/{{#each\s+(\w+)}}([\s\S]*?){{\/each}}/g, (match, arrayName, content) => {
        const arr = data[arrayName];
        if (!Array.isArray(arr)) return '';
        return arr.map(item => content.replace(/{{this}}/g, item)).join('');
    });

    // Handle {{#if var}}...{{/if}}
    result = result.replace(/{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g, (match, varName, content) => {
        return data[varName] ? content : '';
    });

    return result;
}

/**
 * Ensure directory exists
 */
function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

/**
 * Generate homepage with list of all posts
 */
function generateHomepage(posts, templatesDir, outputDir) {
    const baseTemplate = fs.readFileSync(path.join(templatesDir, 'base.html'), 'utf-8');
    const homepageTemplate = fs.readFileSync(path.join(templatesDir, 'homepage.html'), 'utf-8');
    const postCardTemplate = fs.readFileSync(path.join(templatesDir, 'post-card.html'), 'utf-8');

    // Render each post card
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
            tags: post.tags
        });
    }).join('\n');

    // Render homepage
    const homepageContent = renderTemplate(homepageTemplate, {
        posts: postCards
    });

    // Wrap in base template
    const html = renderTemplate(baseTemplate, {
        title: 'My Blog',
        content: homepageContent
    });

    fs.writeFileSync(path.join(outputDir, 'index.html'), html);
}

/**
 * Generate individual article pages
 */
function generateArticles(posts, templatesDir, outputDir) {
    const baseTemplate = fs.readFileSync(path.join(templatesDir, 'base.html'), 'utf-8');
    const articleTemplate = fs.readFileSync(path.join(templatesDir, 'article.html'), 'utf-8');

    ensureDir(path.join(outputDir, 'posts'));

    posts.forEach(post => {
        // Convert markdown to HTML
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
            content: htmlContent
        });

        const html = renderTemplate(baseTemplate, {
            title: `${post.title} | My Blog`,
            content: articleContent
        });

        fs.writeFileSync(path.join(outputDir, 'posts', `${post.slug}.html`), html);
    });
}

/**
 * Generate tag archive pages
 */
function generateTagPages(posts, templatesDir, outputDir) {
    ensureDir(path.join(outputDir, 'tags'));

    // Collect all tags
    const tagMap = {};
    posts.forEach(post => {
        post.tags.forEach(tag => {
            if (!tagMap[tag]) {
                tagMap[tag] = [];
            }
            tagMap[tag].push(post);
        });
    });

    const baseTemplate = fs.readFileSync(path.join(templatesDir, 'base.html'), 'utf-8');
    const postCardTemplate = fs.readFileSync(path.join(templatesDir, 'post-card.html'), 'utf-8');

    // Generate a page for each tag
    Object.keys(tagMap).forEach(tag => {
        const tagPosts = tagMap[tag];
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
                tags: post.tags
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
            content: tagContent
        });

        fs.writeFileSync(path.join(outputDir, 'tags', `${tag}.html`), html);
    });
}

/**
 * Copy static assets (CSS, JS, images, icons, etc)
 */
function copyAssets(srcDir, outputDir) {
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
function copyAssetsFolders(assetsDir, outputDir) {
    if (!fs.existsSync(assetsDir)) {
        return;
    }
    
    const items = fs.readdirSync(assetsDir);
    items.forEach(item => {
        const src = path.join(assetsDir, item);
        const dest = path.join(outputDir, 'assets', item);
        const stats = fs.statSync(src);
        
        if (stats.isDirectory()) {
            fs.cpSync(src, dest, { recursive: true });
        } else {
            ensureDir(path.dirname(dest));
            fs.copyFileSync(src, dest);
        }
    });
}

/**
 * Generate static pages (about, privacy, etc)
 */
function generatePages(contentDir, templatesDir, outputDir) {
    const baseTemplate = fs.readFileSync(path.join(templatesDir, 'base.html'), 'utf-8');
    const pageTemplate = fs.readFileSync(path.join(templatesDir, 'page.html'), 'utf-8');
    
    // List of page files to generate
    const pageFiles = ['about.md', 'privacy.md'];
    
    pageFiles.forEach(file => {
        const filePath = path.join(contentDir, file);
        if (!fs.existsSync(filePath)) {
            return;
        }
        
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Extract frontmatter
        const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
        let title = 'Page';
        let pageContent = content;
        
        if (match) {
            const [, frontmatterStr, bodyContent] = match;
            frontmatterStr.split('\n').forEach(line => {
                const [key, ...valueParts] = line.split(':');
                if (key && valueParts.length > 0) {
                    if (key.trim() === 'title') {
                        title = valueParts.join(':').trim();
                    }
                }
            });
            pageContent = bodyContent.trim();
        }
        
        // Convert markdown to HTML
        const htmlContent = markdownToHtml(pageContent);
        
        // Generate page
        const slug = file.replace('.md', '');
        const pageHtml = renderTemplate(pageTemplate, {
            title: title,
            content: htmlContent
        });
        
        const html = renderTemplate(baseTemplate, {
            title: `${title} | My Blog`,
            content: pageHtml
        });
        
        fs.writeFileSync(path.join(outputDir, `${slug}.html`), html);
    });
}

/**
 * Main build function
 */
function build(contentDir, templatesDir, outputDir) {
    console.log('🔨 Building blog...');

    // Clean output directory
    if (fs.existsSync(outputDir)) {
        fs.rmSync(outputDir, { recursive: true });
    }
    fs.mkdirSync(outputDir, { recursive: true });

    // Get all posts
    const posts = getAllPosts(contentDir);
    
    if (posts.length === 0) {
        console.log('⚠️  No blog posts found in content/ directory');
    } else {
        console.log(`📝 Found ${posts.length} post(s)`);
    }

    // Generate pages
    generateHomepage(posts, templatesDir, outputDir);
    generateArticles(posts, templatesDir, outputDir);
    generateTagPages(posts, templatesDir, outputDir);
    generatePages(contentDir, templatesDir, outputDir);
    copyAssets(templatesDir, outputDir);
    
    // Copy assets (images, icons)
    const assetsDir = path.join(path.dirname(templatesDir), 'assets');
    copyAssetsFolders(assetsDir, outputDir);

    console.log('✅ Build complete!');
    console.log(`📁 Output: ${outputDir}`);
}

module.exports = { build, renderTemplate, generateHomepage, generateArticles, generateTagPages };
