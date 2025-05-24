#!/usr/bin/env node

/**
 * 🔍 Final Verification - Vercel Deployment Ready
 * 
 * This script verifies all configurations are correct for successful Vercel deployment
 */

import fs from 'fs';
import path from 'path';

const errors = [];
const warnings = [];
const successes = [];

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    successes.push(`✅ ${description}: ${filePath}`);
    return true;
  } else {
    errors.push(`❌ ${description}: ${filePath} NOT FOUND`);
    return false;
  }
}

function checkFileContent(filePath, searchText, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(searchText)) {
      successes.push(`✅ ${description}`);
      return true;
    } else {
      warnings.push(`⚠️ ${description}: Not found in ${filePath}`);
      return false;
    }
  } catch (error) {
    errors.push(`❌ ${description}: Cannot read ${filePath}`);
    return false;
  }
}

console.log('🚀 VERCEL DEPLOYMENT READINESS CHECK');
console.log('==========================================\n');

// Check essential files
checkFile('vercel.json', 'Vercel configuration');
checkFile('package.json', 'Package configuration');
checkFile('api/health.js', 'Health API endpoint');
checkFile('api/convert-to-svg.js', 'SVG conversion API');
checkFile('src/App.vue', 'Vue.js main component');
checkFile('src/composables/useImageConversion.js', 'Image conversion logic');
checkFile('dist/index.html', 'Built frontend (run npm run build if missing)');

// Check vercel.json configuration
console.log('\n📄 Checking vercel.json configuration...');
checkFileContent('vercel.json', '"public": true', 'Public access enabled');
checkFileContent('vercel.json', '"version": 2', 'Modern Vercel config version');
checkFileContent('vercel.json', 'Access-Control-Allow-Origin', 'CORS headers configured');
checkFileContent('vercel.json', 'maxDuration', 'Function timeout configured');

// Check API endpoints
console.log('\n🔌 Checking API endpoints...');
checkFileContent('api/health.js', 'export default function handler', 'Health endpoint format');
checkFileContent('api/health.js', 'Access-Control-Allow-Origin', 'Health CORS headers');
checkFileContent('api/convert-to-svg.js', 'formidable', 'File upload handling');
checkFileContent('api/convert-to-svg.js', 'sharp', 'Image processing library');
checkFileContent('api/convert-to-svg.js', 'potrace', 'SVG conversion library');

// Check frontend configuration
console.log('\n🎨 Checking frontend configuration...');
checkFileContent('src/composables/useImageConversion.js', 'vercel.app', 'Vercel environment detection');
checkFileContent('src/composables/useImageConversion.js', '/api', 'API path configuration');
checkFileContent('package.json', 'formidable', 'Formidable dependency for Vercel');

// Check mobile optimizations
console.log('\n📱 Checking mobile optimizations...');
checkFile('VERCEL-SUCCESS-TEST.html', 'Mobile test page');
checkFileContent('src/style.css', '@media', 'Responsive design');
checkFileContent('src/App.vue', 'mobile', 'Mobile-friendly interface');

// Results summary
console.log('\n' + '='.repeat(50));
console.log('📊 VERIFICATION RESULTS');
console.log('='.repeat(50));

if (successes.length > 0) {
  console.log('\n✅ SUCCESSES:');
  successes.forEach(success => console.log(`  ${success}`));
}

if (warnings.length > 0) {
  console.log('\n⚠️ WARNINGS:');
  warnings.forEach(warning => console.log(`  ${warning}`));
}

if (errors.length > 0) {
  console.log('\n❌ ERRORS:');
  errors.forEach(error => console.log(`  ${error}`));
}

console.log('\n' + '='.repeat(50));

if (errors.length === 0) {
  console.log('🎉 PROJECT IS READY FOR VERCEL DEPLOYMENT!');
  console.log('\n📋 Next Steps:');
  console.log('1. Commit all changes to your GitHub repository');
  console.log('2. Push to main/master branch');
  console.log('3. Vercel will automatically deploy');
  console.log('4. Test the deployed app on mobile devices');
  console.log('\n🔗 After deployment, test at:');
  console.log('   • https://[your-app].vercel.app');
  console.log('   • https://[your-app].vercel.app/api/health');
  console.log('   • https://[your-app].vercel.app/VERCEL-SUCCESS-TEST.html');
} else {
  console.log('🚨 DEPLOYMENT NOT READY - Please fix errors above');
  process.exit(1);
}

console.log('\n💡 Need help? Check VERCEL-DEPLOYMENT-READY.md for details');
console.log('='.repeat(50));
