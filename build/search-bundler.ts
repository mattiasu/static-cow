import path from 'path';
import { build } from 'esbuild';

/**
 * Compiles src/search.ts into a self-contained browser script at dist/search.js.
 * Uses esbuild for fast TypeScript bundling with no external runtime dependencies.
 */
export async function bundleSearchScript(srcDir: string, outputDir: string): Promise<void> {
  await build({
    entryPoints: [path.join(srcDir, 'search.ts')],
    outfile: path.join(outputDir, 'search.js'),
    bundle: true,
    minify: true,
    target: ['es2020'],
    platform: 'browser',
  });
  console.log('🔍 Search script bundled → dist/search.js');
}
