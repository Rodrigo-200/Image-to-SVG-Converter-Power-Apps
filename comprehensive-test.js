// Comprehensive test suite for Image to SVG Converter
import fetch from 'node-fetch';
import fs from 'fs';
import FormData from 'form-data';
import { createCanvas } from 'canvas';

const API_BASE = 'http://localhost:3001';

// Test scenarios
const testScenarios = [
  {
    name: 'Basic Border Removal',
    description: 'Test with obvious white borders',
    imageConfig: {
      width: 400,
      height: 300,
      borderSize: 50,
      contentColor: '#2563eb',
      backgroundColor: '#ffffff'
    },
    expectedCrop: { left: 50, top: 50, width: 300, height: 200 }
  },
  {
    name: 'Minimal Borders',
    description: 'Test with small borders',
    imageConfig: {
      width: 200,
      height: 150,
      borderSize: 10,
      contentColor: '#dc2626',
      backgroundColor: '#f8f9fa'
    },
    expectedCrop: { left: 10, top: 10, width: 180, height: 130 }
  },
  {
    name: 'No Borders',
    description: 'Test with image that has no borders',
    imageConfig: {
      width: 300,
      height: 200,
      borderSize: 0,
      contentColor: '#059669',
      backgroundColor: '#059669'
    },
    expectedCrop: { left: 0, top: 0, width: 300, height: 200 }
  }
];

function createTestImage(config) {
  const canvas = createCanvas(config.width, config.height);
  const ctx = canvas.getContext('2d');
  
  // Fill background (borders)
  ctx.fillStyle = config.backgroundColor;
  ctx.fillRect(0, 0, config.width, config.height);
  
  // Add content area if there are borders
  if (config.borderSize > 0) {
    ctx.fillStyle = config.contentColor;
    ctx.fillRect(
      config.borderSize, 
      config.borderSize, 
      config.width - (config.borderSize * 2), 
      config.height - (config.borderSize * 2)
    );
    
    // Add some text to make it interesting
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('TEST', config.width / 2, config.height / 2);
  }
  
  return canvas.toBuffer('image/png');
}

async function testBorderRemoval(scenario) {
  console.log(`\n🧪 Testing: ${scenario.name}`);
  console.log(`📝 ${scenario.description}`);
  
  try {
    // Create test image
    const imageBuffer = createTestImage(scenario.imageConfig);
    console.log(`📸 Created test image: ${scenario.imageConfig.width}x${scenario.imageConfig.height}`);
    
    // Test border data
    const borderData = {
      originalWidth: scenario.imageConfig.width,
      originalHeight: scenario.imageConfig.height,
      borders: {
        top: scenario.imageConfig.borderSize,
        bottom: scenario.imageConfig.borderSize,
        left: scenario.imageConfig.borderSize,
        right: scenario.imageConfig.borderSize
      },
      contentArea: {
        x: scenario.expectedCrop.left,
        y: scenario.expectedCrop.top,
        width: scenario.expectedCrop.width,
        height: scenario.expectedCrop.height
      }
    };
    
    // Create form data
    const formData = new FormData();
    formData.append('image', imageBuffer, `test-${scenario.name.toLowerCase().replace(/\s/g, '-')}.png`);
    formData.append('removeBorder', 'true');
    formData.append('borderData', JSON.stringify(borderData));
    formData.append('quality', 'high');
    
    console.log(`📤 Sending request with border data...`);
    
    // Send to API
    const response = await fetch(`${API_BASE}/convert-to-svg`, {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      const result = await response.json();
      
      if (result.success) {
        // Save result
        const filename = `test-result-${scenario.name.toLowerCase().replace(/\s/g, '-')}.svg`;
        fs.writeFileSync(filename, result.svg);
        
        console.log(`✅ SUCCESS: SVG generated`);
        console.log(`📁 Saved as: ${filename}`);
        console.log(`📊 Original size: ${result.originalSize} bytes`);
        console.log(`📊 SVG size: ${result.svgSize} characters`);
        
        // Validate SVG structure
        if (result.svg.startsWith('<svg') && result.svg.includes('</svg>')) {
          console.log(`✅ SVG structure valid`);
        } else {
          console.log(`❌ SVG structure invalid`);
        }
        
        // Check viewBox dimensions
        const viewBoxMatch = result.svg.match(/viewBox="([^"]+)"/);
        if (viewBoxMatch) {
          console.log(`📐 SVG viewBox: ${viewBoxMatch[1]}`);
        }
        
        return { success: true, result };
      } else {
        console.log(`❌ API returned error: ${result.error}`);
        return { success: false, error: result.error };
      }
    } else {
      const errorText = await response.text();
      console.log(`❌ HTTP error ${response.status}: ${errorText}`);
      return { success: false, error: `HTTP ${response.status}` };
    }
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testHealthEndpoint() {
  console.log('\n🏥 Testing Health Endpoint...');
  
  try {
    const response = await fetch(`${API_BASE}/health`);
    const result = await response.json();
    
    if (response.ok && result.status === 'OK') {
      console.log('✅ Health endpoint working');
      console.log(`⏰ Server time: ${result.timestamp}`);
      return true;
    } else {
      console.log('❌ Health endpoint failed');
      return false;
    }
  } catch (error) {
    console.log(`❌ Health check failed: ${error.message}`);
    return false;
  }
}

async function runComprehensiveTest() {
  console.log('🚀 Starting Comprehensive Border Removal Test Suite');
  console.log('=' .repeat(60));
  
  // Test health first
  const healthOk = await testHealthEndpoint();
  if (!healthOk) {
    console.log('\n❌ Server not responding, aborting tests');
    return;
  }
  
  // Run border removal tests
  let passedTests = 0;
  let totalTests = testScenarios.length;
  
  for (const scenario of testScenarios) {
    const result = await testBorderRemoval(scenario);
    if (result.success) {
      passedTests++;
    }
  }
  
  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('=' .repeat(60));
  console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests} tests`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! Border removal is working perfectly.');
    console.log('🚀 Ready for production use in Power Apps!');
  } else {
    console.log('\n⚠️  Some tests failed. Check the output above for details.');
  }
  
  console.log('\n📁 Generated test files:');
  testScenarios.forEach(scenario => {
    const filename = `test-result-${scenario.name.toLowerCase().replace(/\s/g, '-')}.svg`;
    if (fs.existsSync(filename)) {
      console.log(`  - ${filename}`);
    }
  });
}

// Run the tests
runComprehensiveTest().catch(console.error);
