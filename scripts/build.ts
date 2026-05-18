#!/usr/bin/env node

import path from 'path';

// html-generator.js is not yet migrated to TypeScript
const { build } = require('./html-generator') as {
  build: (contentDir: string, templatesDir: string, outputDir: string) => void;
};

const contentDir = path.join(__dirname, '../content');
const templatesDir = path.join(__dirname, '../src');
const outputDir = path.join(__dirname, '../dist');

build(contentDir, templatesDir, outputDir);
