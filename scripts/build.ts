#!/usr/bin/env node

import path from 'path';
import { runPipeline } from './pipeline';
import type { Dirs } from './pipeline';

const dirs: Dirs = {
  contentDir: path.join(__dirname, '../content'),
  templatesDir: path.join(__dirname, '../src'),
  outputDir: path.join(__dirname, '../dist'),
};

runPipeline(dirs).catch(err => {
  console.error(err);
  process.exit(1);
});
