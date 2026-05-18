#!/usr/bin/env node

import path from 'path';
import fs, { watch } from 'fs';
import http from 'http';
import { build } from './html-generator';

const contentDir = path.join(__dirname, '../content');
const templatesDir = path.join(__dirname, '../src');
const outputDir = path.join(__dirname, '../dist');
const PORT = 3000;

// Initial build
build(contentDir, templatesDir, outputDir);

// Watch for changes
let debounceTimer: ReturnType<typeof setTimeout> | undefined;

function setupWatcher(): fs.FSWatcher[] {
  const watcher1 = watch(contentDir, () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      console.log('\n📝 Content changed, rebuilding...');
      build(contentDir, templatesDir, outputDir);
    }, 300);
  });

  const watcher2 = watch(templatesDir, () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      console.log('\n🎨 Templates changed, rebuilding...');
      build(contentDir, templatesDir, outputDir);
    }, 300);
  });

  return [watcher1, watcher2];
}

// HTTP Server
const server = http.createServer((req, res) => {
  const url = req.url ?? '/';
  let filePath = path.join(outputDir, url === '/' ? 'index.html' : url);

  // Ensure we're serving from dist directory
  if (!filePath.startsWith(outputDir)) {
    filePath = path.join(outputDir, 'index.html');
  }

  // Add .html extension if not present
  if (!filePath.includes('.')) {
    filePath += '.html';
  }

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>404 - Not Found</h1>');
    return;
  }

  const ext = path.extname(filePath);
  const mimeTypes: Record<string, string | undefined> = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
  };

  const mimeType = mimeTypes[ext] ?? 'application/octet-stream';
  const content = fs.readFileSync(filePath);

  res.writeHead(200, {
    'Content-Type': mimeType,
    'Cache-Control': 'no-cache',
  });
  res.end(content);
});

// Start server
const watchers = setupWatcher();

server.listen(PORT, () => {
  console.log('\n🚀 Dev server running at http://localhost:' + PORT);
  console.log('📁 Serving from: ' + outputDir);
  console.log('👁️  Watching for changes in content/ and src/');
  console.log('Press Ctrl+C to stop\n');
});

// Cleanup on exit
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down...');
  server.close();
  watchers.forEach(w => w.close());
  process.exit(0);
});
