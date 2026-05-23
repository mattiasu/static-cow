import fs from 'fs';
import CleanCSS from 'clean-css';

/**
 * Reads a CSS file, minifies it with clean-css, and writes the result to dest.
 * Throws if clean-css reports any errors.
 */
export function minifyCss(src: string, dest: string): void {
  const input = fs.readFileSync(src, 'utf-8');
  const result = new CleanCSS().minify(input);

  if (result.errors.length > 0) {
    throw new Error(`CSS minification failed: ${result.errors.join(', ')}`);
  }

  fs.writeFileSync(dest, result.styles);

  const originalSize = Buffer.byteLength(input, 'utf-8');
  const minifiedSize = Buffer.byteLength(result.styles, 'utf-8');
  const saved = Math.round((1 - minifiedSize / originalSize) * 100);
  console.log(`🎨 CSS minified: ${originalSize}B → ${minifiedSize}B (${saved}% smaller)`);
}
