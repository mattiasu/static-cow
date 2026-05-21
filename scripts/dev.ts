#!/usr/bin/env node

import path from 'path';
import fs, { watch } from 'fs';
import http from 'http';
import { runPipeline } from './pipeline';
import type { Dirs } from './pipeline';

const dirs: Dirs = {
  contentDir: path.join(__dirname, '../content'),
  templatesDir: path.join(__dirname, '../src'),
  outputDir: path.join(__dirname, '../dist'),
};

const PORT = 3000;

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

function resolveFilePath(outputDir: string, url: string): string {
  let filePath = path.join(outputDir, url === '/' ? 'index.html' : url);

  if (!filePath.startsWith(outputDir)) {
    filePath = path.join(outputDir, 'index.html');
  }

  if (!filePath.includes('.')) {
    const indexPath = path.join(filePath, 'index.html');
    filePath = fs.existsSync(indexPath) ? indexPath : filePath + '.html';
  }

  return filePath;
}

function createServer(outputDir: string): http.Server {
  return http.createServer((req, res) => {
    const url = req.url ?? '/';
    const filePath = resolveFilePath(outputDir, url);

    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 - Not Found</h1>');
      return;
    }

    const ext = path.extname(filePath);
    const mimeType = MIME_TYPES[ext] ?? 'application/octet-stream';
    const content = fs.readFileSync(filePath);

    res.writeHead(200, {
      'Content-Type': mimeType,
      'Cache-Control': 'no-cache',
    });
    res.end(content);
  });
}

function setupWatcher(dirs: Dirs): fs.FSWatcher[] {
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;

  const watcher1 = watch(dirs.contentDir, () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      console.log('\n📝 Content changed, rebuilding...');
      runPipeline(dirs).catch(console.error);
    }, 300);
  });

  const watcher2 = watch(dirs.templatesDir, () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      console.log('\n🎨 Templates changed, rebuilding...');
      runPipeline(dirs).catch(console.error);
    }, 300);
  });

  return [watcher1, watcher2];
}

async function main(): Promise<void> {
  await runPipeline(dirs);

  const watchers = setupWatcher(dirs);
  const server = createServer(dirs.outputDir);

  server.listen(PORT, () => {
    console.log('\n🚀 Dev server running at http://localhost:' + PORT);
    console.log('📁 Serving from: ' + dirs.outputDir);
    console.log('👁️  Watching for changes in content/ and src/');
    console.log('Press Ctrl+C to stop\n');
  });

  process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down...');
    server.close();
    watchers.forEach(w => w.close());
    process.exit(0);
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
