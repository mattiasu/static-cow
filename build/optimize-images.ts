import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { parseFrontmatter } from './markdown-parser';

const CONTENT_DIR = path.join(__dirname, '../content');
const IMAGES_SRC_DIR = path.join(__dirname, '../web/assets/images');
const IMAGES_OUT_DIR = path.join(__dirname, '../dist/assets/images');

function extractFilename(ref: string): string {
  return path.basename(ref);
}

function extractInlineImages(markdown: string): string[] {
  const results: string[] = [];
  const regex = /!\[.*?\]\(([^)]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(markdown)) !== null) {
    results.push(path.basename(match[1]));
  }
  return results;
}

type UpToDateStatus = 'missing' | 'skip' | 'process';

function checkStatus(srcPath: string, outPath: string): UpToDateStatus {
  if (!fs.existsSync(srcPath)) return 'missing';
  if (!fs.existsSync(outPath)) return 'process';
  const srcMtime = fs.statSync(srcPath).mtimeMs;
  const outMtime = fs.statSync(outPath).mtimeMs;
  return srcMtime < outMtime ? 'skip' : 'process';
}

interface ImageSpec {
  width: number;
  height: number | null;
  crop: boolean;
  suffix: string;
}

async function processImage(srcFilename: string, spec: ImageSpec): Promise<void> {
  const srcPath = path.join(IMAGES_SRC_DIR, srcFilename);
  const base = path.parse(srcFilename).name;
  const outFilename = `${base}${spec.suffix}.webp`;
  const outPath = path.join(IMAGES_OUT_DIR, outFilename);

  const status = checkStatus(srcPath, outPath);

  if (status === 'missing') {
    console.warn(`  Warning: source image not found: ${srcFilename}`);
    return;
  }

  if (status === 'skip') {
    console.log(`  Skipped (up to date): ${outFilename}`);
    return;
  }

  try {
    let pipeline = sharp(srcPath);

    if (spec.crop && spec.height !== null) {
      pipeline = pipeline.resize(spec.width, spec.height, { fit: 'cover', position: 'centre' });
    } else {
      pipeline = pipeline.resize({ width: spec.width, withoutEnlargement: true });
    }

    await pipeline.webp().toFile(outPath);
    console.log(`  Generated: ${outFilename}`);
  } catch (err) {
    console.warn(`  Warning: failed to process ${srcFilename}: ${(err as Error).message}`);
  }
}

export async function optimizeImages(): Promise<void> {
  fs.mkdirSync(IMAGES_OUT_DIR, { recursive: true });

  const mdFiles = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));

  const profileImages = new Set<string>();
  const heroImages = new Set<string>();
  const inlineImages = new Set<string>();

  for (const file of mdFiles) {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
    const { metadata, content } = parseFrontmatter(raw);

    const profileImage = metadata['profileImage'];
    const hero = metadata['hero'];
    if (typeof profileImage === 'string' && profileImage) profileImages.add(extractFilename(profileImage));
    if (typeof hero === 'string' && hero) heroImages.add(extractFilename(hero));
    for (const img of extractInlineImages(content)) inlineImages.add(img);
  }

  for (const img of profileImages) inlineImages.delete(img);
  for (const img of heroImages) inlineImages.delete(img);

  console.log('Optimizing images...');

  for (const img of profileImages) {
    await processImage(img, { width: 48, height: 48, crop: true, suffix: '-48x48' });
  }

  for (const img of heroImages) {
    await processImage(img, { width: 1200, height: 630, crop: true, suffix: '-1200x630' });
    await processImage(img, { width: 400, height: 225, crop: true, suffix: '-400x225' });
  }

  for (const img of inlineImages) {
    await processImage(img, { width: 800, height: null, crop: false, suffix: '-800w' });
    await processImage(img, { width: 400, height: null, crop: false, suffix: '-400w' });
  }
}

if (require.main === module) {
  optimizeImages().catch(err => {
    console.error('Image optimization failed:', err);
    process.exit(1);
  });
}
