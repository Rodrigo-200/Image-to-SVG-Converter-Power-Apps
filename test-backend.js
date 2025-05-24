// Test script to verify backend SVG conversion
import FormData from 'form-data';
import fetch from 'node-fetch';
import fs from 'fs';

const BACKEND_URL = 'http://localhost:3001';

async function testBackendConversion() {
  console.log('🧪 Testing backend SVG conversion...');
  
  try {
    // Test health check
    console.log('1. Testing health check...');
    const healthResponse = await fetch(`${BACKEND_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    
    // Create a simple test image (we'll use a small PNG)
    console.log('2. Testing image conversion...');
    
    // For this test, we'll create a simple 100x100 red square PNG
    const testImagePath = './test-image.png';
    
    // Create test image if it doesn't exist
    if (!fs.existsSync(testImagePath)) {
      console.log('⚠️  Test image not found. Please upload an image manually through the frontend.');
      return;
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('image', fs.createReadStream(testImagePath));
    formData.append('removeBorder', 'true');
    formData.append('quality', 'medium');
    formData.append('size', 'auto');
    
    // Send conversion request
    const conversionResponse = await fetch(`${BACKEND_URL}/convert`, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });
    
    if (conversionResponse.ok) {
      const result = await conversionResponse.json();
      console.log('✅ Conversion successful!');
      console.log('📊 SVG size:', result.svg.length, 'characters');
      console.log('🎯 First 200 chars:', result.svg.substring(0, 200) + '...');
      
      // Save result to file
      fs.writeFileSync('./test-output.svg', result.svg);
      console.log('💾 SVG saved to test-output.svg');
      
    } else {
      const error = await conversionResponse.text();
      console.error('❌ Conversion failed:', error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBackendConversion();
