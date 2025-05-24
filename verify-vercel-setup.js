// Test script to verify Vercel API functions structure
import fs from 'fs';
import path from 'path';

console.log('🔍 Vercel API Functions Validation');
console.log('=====================================');

const apiDir = './api';
const requiredFiles = ['health.js', 'convert-to-svg.js'];

// Check if API directory exists
if (!fs.existsSync(apiDir)) {
    console.error('❌ API directory does not exist');
    process.exit(1);
}

console.log('✅ API directory exists');

// Check each required file
for (const file of requiredFiles) {
    const filePath = path.join(apiDir, file);
    if (!fs.existsSync(filePath)) {
        console.error(`❌ Missing required file: ${file}`);
        process.exit(1);
    }
    
    // Check if file exports default function
    const content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('export default')) {
        console.error(`❌ File ${file} does not export default function`);
        process.exit(1);
    }
    
    console.log(`✅ ${file} - Structure valid`);
}

// Check vercel.json
if (!fs.existsSync('./vercel.json')) {
    console.error('❌ vercel.json not found');
    process.exit(1);
}

const vercelConfig = JSON.parse(fs.readFileSync('./vercel.json', 'utf8'));

// Validate modern vercel.json structure (no builds section)
if (vercelConfig.builds) {
    console.error('❌ vercel.json should not contain "builds" section (causes conflicts)');
    process.exit(1);
}

// Check for required configuration
if (!vercelConfig.buildCommand || !vercelConfig.outputDirectory) {
    console.error('❌ vercel.json missing buildCommand or outputDirectory');
    process.exit(1);
}

console.log('✅ vercel.json - Modern configuration valid');

// Check package.json dependencies
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const requiredDeps = ['formidable', 'sharp', 'potrace'];

for (const dep of requiredDeps) {
    if (!packageJson.dependencies[dep]) {
        console.error(`❌ Missing dependency: ${dep}`);
        process.exit(1);
    }
    console.log(`✅ Dependency ${dep} - Found`);
}

console.log('\n🎉 All Vercel API functions are properly configured!');
console.log('📝 Ready for deployment with:');
console.log('   npm run build && vercel --prod');
console.log('\n📱 Test mobile connectivity after deployment with:');
console.log('   [your-vercel-url]/vercel-mobile-test.html');
