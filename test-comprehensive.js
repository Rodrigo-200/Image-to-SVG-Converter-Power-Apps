// Comprehensive test script for SVG converter
import fs from 'fs';
import path from 'path';

console.log('🧪 COMPREHENSIVE SVG CONVERTER TEST');
console.log('=====================================');

// Test 1: Backend Health Check
async function testBackendHealth() {
  console.log('\n1️⃣ Testing Backend Health...');
  try {
    const response = await fetch('http://localhost:3001/health');
    const result = await response.json();
    console.log('✅ Backend Status:', result.status);
    console.log('✅ Timestamp:', result.timestamp);
    return true;
  } catch (error) {
    console.error('❌ Backend Health Check Failed:', error.message);
    return false;
  }
}

// Test 2: Create Simple Test Image (Base64)
function createTestImageBase64() {
  console.log('\n2️⃣ Creating Test Image...');
  
  // Simple 10x10 red square PNG in base64 (minimum size for Sharp/Potrace)
  const redSquarePNG = 'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAABYSURBVBiVY2CgEfj//z8DJQALAwMDA8P///8ZGBgYGP7//8/AwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwEA1AADNQQoK7kZKUwAAAABJRU5ErkJggg==';
  
  // Convert to buffer
  const buffer = Buffer.from(redSquarePNG, 'base64');
  
  console.log('✅ Test image created (10x10 red square)');
  console.log('✅ Size:', buffer.length, 'bytes');
  
  return buffer;
}

// Test 3: Test Backend Conversion
async function testBackendConversion() {
  console.log('\n3️⃣ Testing Backend SVG Conversion...');
  
  try {
    const imageBuffer = createTestImageBase64();
    
    // Create FormData
    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: 'image/png' });
    formData.append('image', blob, 'test.png');
    formData.append('removeBorder', 'true');
    formData.append('quality', 'medium');
    formData.append('size', 'auto');
    
    console.log('📤 Sending conversion request...');
    
    const response = await fetch('http://localhost:3001/convert-to-svg', {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Conversion successful!');
      console.log('✅ SVG size:', result.svg.length, 'characters');
      console.log('✅ Preview:', result.svg.substring(0, 100) + '...');
      
      // Save test result
      fs.writeFileSync('test-output.svg', result.svg);
      console.log('💾 SVG saved to test-output.svg');
      
      return true;
    } else {
      const error = await response.text();
      console.error('❌ Conversion failed:', error);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Backend conversion test failed:', error.message);
    return false;
  }
}

// Test 4: Frontend Components Check
function testFrontendComponents() {
  console.log('\n4️⃣ Testing Frontend Components...');
  
  const components = [
    'src/App.vue',
    'src/components/ImageUpload.vue',
    'src/components/PreviewArea.vue',
    'src/components/ControlsPanel.vue',
    'src/composables/useImageConversion.js'
  ];
  
  let allExist = true;
  
  components.forEach(component => {
    if (fs.existsSync(component)) {
      console.log('✅', component);
    } else {
      console.log('❌', component, '- Missing!');
      allExist = false;
    }
  });
  
  return allExist;
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting comprehensive tests...\n');
  
  const results = {
    backendHealth: false,
    frontendComponents: false,
    backendConversion: false
  };
  
  // Test backend health
  results.backendHealth = await testBackendHealth();
  
  // Test frontend components
  results.frontendComponents = testFrontendComponents();
  
  // Test backend conversion (only if health check passed)
  if (results.backendHealth) {
    results.backendConversion = await testBackendConversion();
  }
  
  // Summary
  console.log('\n🎯 TEST SUMMARY');
  console.log('================');
  console.log('Backend Health:', results.backendHealth ? '✅ PASS' : '❌ FAIL');
  console.log('Frontend Components:', results.frontendComponents ? '✅ PASS' : '❌ FAIL');
  console.log('Backend Conversion:', results.backendConversion ? '✅ PASS' : '❌ FAIL');
  
  const allPassed = Object.values(results).every(result => result);
  console.log('\n🏆 OVERALL:', allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
  
  if (allPassed) {
    console.log('\n🎉 SVG Converter is fully functional!');
    console.log('🌐 Frontend: http://localhost:5173');
    console.log('🔧 Backend: http://localhost:3001');
    console.log('📝 Ready for manual testing in browser');
  }
  
  return allPassed;
}

// Export for use or run directly
runAllTests().catch(console.error);
