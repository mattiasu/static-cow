import path from 'path';
import { build } from 'esbuild';

/**
 * Compiles web/feedback.ts into a self-contained browser script at dist/feedback.js.
 */
export async function bundleFeedbackScript(srcDir: string, outputDir: string): Promise<void> {
  await build({
    entryPoints: [path.join(srcDir, 'feedback.ts')],
    outfile: path.join(outputDir, 'feedback.js'),
    bundle: true,
    minify: true,
    target: ['es2020'],
    platform: 'browser',
  });
  console.log('💬 Feedback script bundled → dist/feedback.js');
}
