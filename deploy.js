#!/usr/bin/env node

/**
 * Deployment helper script for Image to SVG Converter
 * Automates the build and deployment process
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Image to SVG Converter - Deployment Helper\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: package.json not found. Please run from project root.');
  process.exit(1);
}

try {
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('\n🔨 Building for production...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('\n✅ Build completed successfully!');
  console.log('\n📁 Built files are in the dist/ directory');
  console.log('\n🌐 Deployment options:');
  console.log('   • Static hosting: Upload dist/ folder');
  console.log('   • Node.js hosting: Deploy server.js + dist/');
  console.log('   • Local preview: npm run preview');
  
  console.log('\n🎯 Next steps for Power Apps:');
  console.log('   1. Host the application online');
  console.log('   2. Use the converter to create SVG assets');
  console.log('   3. Import SVGs directly into Power Apps');
  
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
