#!/usr/bin/env node

import { cp, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const sourceDir = join(rootDir, 'src-tauri', 'assets');
const targetDir = join(rootDir, 'public', 'assets');

async function syncAssets() {
  try {
    console.log('🔄 Syncing assets...');
    console.log(`   Source: ${sourceDir}`);
    console.log(`   Target: ${targetDir}`);

    // Check if source exists
    if (!existsSync(sourceDir)) {
      console.error(`❌ Error: Source directory not found: ${sourceDir}`);
      process.exit(1);
    }

    // Create target parent directory if it doesn't exist
    const publicDir = join(rootDir, 'public');
    if (!existsSync(publicDir)) {
      console.log('📁 Creating public directory...');
      await mkdir(publicDir, { recursive: true });
    }

    // Remove target directory if it exists and copy fresh
    console.log('📋 Copying assets...');
    await cp(sourceDir, targetDir, {
      recursive: true,
      force: true,
    });

    console.log('✅ Assets synced successfully!');
  } catch (error) {
    console.error('❌ Error syncing assets:', error);
    process.exit(1);
  }
}

syncAssets();
