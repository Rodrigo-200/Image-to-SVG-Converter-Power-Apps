/**
 * Test to debug SVG output issues
 */

import fs from 'fs'
import FormData from 'form-data'
import fetch from 'node-fetch'

const BACKEND_URL = 'http://localhost:3001'

console.log('🔍 DEBUGGING SVG OUTPUT ISSUES')
console.log('===============================')

async function testSvgOutput() {
  try {
    // Read the test image
    const imageBuffer = fs.readFileSync('test-output.svg')
    console.log('📁 Read test file, size:', imageBuffer.length, 'bytes')
    
    // Check first few characters
    const preview = imageBuffer.toString('utf8', 0, 100)
    console.log('📝 File preview (first 100 chars):', JSON.stringify(preview))
    
    // Check if it starts with valid SVG
    const content = imageBuffer.toString('utf8')
    if (content.startsWith('<svg')) {
      console.log('✅ File starts with <svg> tag')
    } else if (content.startsWith('<?xml')) {
      console.log('✅ File starts with XML declaration')
    } else {
      console.log('❌ File does not start with valid SVG/XML')
      console.log('First 50 characters:', JSON.stringify(content.substring(0, 50)))
    }
    
    // Check for any non-printing characters
    const hasNonPrinting = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/.test(content)
    if (hasNonPrinting) {
      console.log('❌ File contains non-printing characters')
    } else {
      console.log('✅ File contains only valid characters')
    }
    
    // Try to create a new test conversion
    console.log('\n🧪 Creating new test conversion...')
    
    // Create a simple test image
    const testImageData = Buffer.from([
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 10, 0, 0, 0, 10, 8, 2, 0, 0, 0, 2, 80, 88, 234, 0, 0, 0, 34, 73, 68, 65, 84, 120, 156, 99, 248, 207, 192, 192, 192, 240, 15, 4, 12, 12, 140, 64, 4, 4, 140, 140, 12, 12, 12, 255, 3, 18, 144, 129, 4, 18, 0, 0, 69, 94, 4, 241, 44, 216, 251, 233, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130
    ])
    
    // Test backend conversion
    const formData = new FormData()
    formData.append('image', testImageData, { filename: 'test.png', contentType: 'image/png' })
    formData.append('removeBorder', 'false')
    formData.append('svgColor', '#000000')
    formData.append('size', 'auto')
    formData.append('quality', 'high')
    
    console.log('📤 Sending test conversion request...')
    const response = await fetch(`${BACKEND_URL}/convert-to-svg`, {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      throw new Error(`Backend error: ${response.status} ${response.statusText}`)
    }
    
    const result = await response.json()
    console.log('📥 Received response, success:', result.success)
    
    if (result.success) {
      console.log('📊 SVG length:', result.svg.length)
      console.log('📝 SVG preview (first 100 chars):', JSON.stringify(result.svg.substring(0, 100)))
      
      // Check if SVG is valid
      if (result.svg.startsWith('<svg')) {
        console.log('✅ Generated SVG starts correctly')
      } else {
        console.log('❌ Generated SVG does not start with <svg>')
      }
      
      // Save to test file
      fs.writeFileSync('debug-output.svg', result.svg, 'utf8')
      console.log('💾 Saved debug output to debug-output.svg')
      
      // Test if the issue is with the content type
      const testBlob = Buffer.from(result.svg, 'utf8')
      fs.writeFileSync('debug-output-with-bom.svg', '\uFEFF' + result.svg, 'utf8')
      console.log('💾 Saved debug output with BOM to debug-output-with-bom.svg')
      
    } else {
      console.log('❌ Conversion failed:', result.error)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testSvgOutput()
