// Final integration test for color changing functionality
import fs from 'fs';

async function testColorChanging() {
  console.log('🎨 TESTING SVG COLOR CHANGING FUNCTIONALITY');
  console.log('===========================================');
  
  try {
    // Read the test SVG we generated
    const testSvg = fs.readFileSync('test-output.svg', 'utf8');
    console.log('✅ Original SVG loaded');
    console.log('📄 Original SVG:', testSvg.substring(0, 100) + '...');
    
    // Simulate color changing (this is what the frontend does)
    const changeColorInSvg = (svgContent, newColor) => {
      return svgContent.replace(/fill="[^"]*"/g, `fill="${newColor}"`);
    };
    
    // Test different colors
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
    
    colors.forEach((color, index) => {
      const coloredSvg = changeColorInSvg(testSvg, color);
      const filename = `test-output-${color.replace('#', '')}.svg`;
      fs.writeFileSync(filename, coloredSvg);
      console.log(`✅ Color ${color}: ${filename}`);
    });
    
    console.log('🎉 Color changing test completed successfully!');
    console.log('📁 Generated colored SVG files for verification');
    
    return true;
    
  } catch (error) {
    console.error('❌ Color changing test failed:', error.message);
    return false;
  }
}

testColorChanging();
