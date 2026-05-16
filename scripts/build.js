#!/usr/bin/env node

const path = require('path');
const { build } = require('./html-generator');

const contentDir = path.join(__dirname, '../content');
const templatesDir = path.join(__dirname, '../src');
const outputDir = path.join(__dirname, '../dist');

build(contentDir, templatesDir, outputDir);
