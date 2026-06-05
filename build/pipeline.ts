import path from 'path';
import { getAllPosts } from './markdown-parser';
import { generateSearchIndex } from './search-indexer';
import { generateSitemap } from './sitemap-generator';
import { bundleSearchScript } from './search-bundler';
import { bundleFeedbackScript } from './feedback-bundler';
import { minifyCss } from './css-minifier';
import { optimizeImages } from './optimize-images';

const SITE_URL = 'https://addy.se';

const { build: buildHtml } = require('./html-generator') as {
  build: (contentDir: string, templatesDir: string, outputDir: string, siteUrl: string) => void;
};

export interface Dirs {
  contentDir: string;
  templatesDir: string;
  outputDir: string;
}

export async function runPipeline(dirs: Dirs): Promise<void> {
  const { contentDir, templatesDir, outputDir } = dirs;
  buildHtml(contentDir, templatesDir, outputDir, SITE_URL);
  await optimizeImages();
  const posts = getAllPosts(contentDir);
  generateSearchIndex(posts, outputDir);
  generateSitemap(posts, outputDir, SITE_URL);
  await bundleSearchScript(templatesDir, outputDir);
  await bundleFeedbackScript(templatesDir, outputDir);
  minifyCss(path.join(templatesDir, 'styles.css'), path.join(outputDir, 'styles.css'));
}
