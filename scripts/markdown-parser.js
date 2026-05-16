const fs = require('fs');
const path = require('path');

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
function parseFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    
    if (!match) {
        return { metadata: {}, content: content };
    }

    const [, frontmatterStr, bodyContent] = match;
    const metadata = {};

    frontmatterStr.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length > 0) {
            const value = valueParts.join(':').trim();
            if (key.trim() === 'tags') {
                metadata.tags = value.split(',').map(t => t.trim()).filter(t => t);
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
function calculateReadingTime(content) {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Get first paragraph as excerpt/intro (max 150 chars)
 */
function getExcerpt(content, maxLength = 150) {
    // Remove markdown formatting for excerpt
    let text = content
        .split('\n')
        .find(line => line.trim() && !line.startsWith('#'));
    
    if (!text) return '';
    
    text = text.replace(/[*_`\[\]()]/g, '');
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

/**
 * Format date as "15 May 2026"
 */
function formatDateShort(dateISO) {
    const date = new Date(dateISO);
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

/**
 * Create a slug from title
 */
function createSlug(title) {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

/**
 * Parse all blog posts from content directory
 */
function getAllPosts(contentDir) {
    const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md'));
    
    const posts = files.map(file => {
        const filePath = path.join(contentDir, file);
        const rawContent = fs.readFileSync(filePath, 'utf-8');
        const { metadata, content } = parseFrontmatter(rawContent);

        const slug = createSlug(metadata.title || file.replace('.md', ''));
        const readingTime = calculateReadingTime(content);
        const excerpt = getExcerpt(content);

        // Parse date
        const date = new Date(metadata.date);
        const dateISO = date.toISOString().split('T')[0];
        const dateFormatted = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const dateShort = formatDateShort(dateISO);

        return {
            slug,
            title: metadata.title || 'Untitled',
            date: dateFormatted,
            dateShort,
            dateISO,
            content,
            tags: metadata.tags || [],
            category: metadata.category || '',
            author: metadata.author || '',
            profileImage: metadata.profileImage || '',
            intro: metadata.intro || '',
            readingTime,
            excerpt,
            raw: rawContent
        };
    });

    // Sort by date, newest first
    return posts.sort((a, b) => new Date(b.dateISO) - new Date(a.dateISO));
}

module.exports = {
    parseFrontmatter,
    calculateReadingTime,
    getExcerpt,
    formatDateShort,
    createSlug,
    getAllPosts
};
