export function optimizeSvg(svgContent, options = {}) {
  const {
    removeComments = true,
    removeMetadata = true,
    removeEmptyGroups = true,
    removeUnusedDefs = true,
    minifyPaths = true,
    minifyColors = true,
    removeWhitespace = true
  } = options

  let optimized = svgContent

  // Remove XML declaration and DOCTYPE if present
  optimized = optimized.replace(/<\?xml[^>]*\?>\s*/gi, '')
  optimized = optimized.replace(/<!DOCTYPE[^>]*>\s*/gi, '')

  if (removeComments) {
    // Remove comments
    optimized = optimized.replace(/<!--[\s\S]*?-->/g, '')
  }

  if (removeMetadata) {
    // Remove metadata elements
    optimized = optimized.replace(/<metadata[\s\S]*?<\/metadata>/gi, '')
    optimized = optimized.replace(/<title[\s\S]*?<\/title>/gi, '')
    optimized = optimized.replace(/<desc[\s\S]*?<\/desc>/gi, '')
  }

  if (removeEmptyGroups) {
    // Remove empty groups
    optimized = optimized.replace(/<g[^>]*>\s*<\/g>/gi, '')
  }

  if (removeUnusedDefs) {
    // Remove empty defs
    optimized = optimized.replace(/<defs[^>]*>\s*<\/defs>/gi, '')
  }

  if (minifyColors) {
    // Convert colors to shorter formats
    optimized = optimized.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/g, (match, r, g, b) => {
      const hex = '#' + 
        parseInt(r).toString(16).padStart(2, '0') +
        parseInt(g).toString(16).padStart(2, '0') +
        parseInt(b).toString(16).padStart(2, '0')
      return hex
    })
    
    // Shorten hex colors when possible
    optimized = optimized.replace(/#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3/gi, '#$1$2$3')
  }

  if (minifyPaths) {
    // Basic path optimization
    optimized = optimized.replace(/\s+([MmLlHhVvCcSsQqTtAaZz])/g, '$1')
    optimized = optimized.replace(/([MmLlHhVvCcSsQqTtAaZz])\s+/g, '$1')
    optimized = optimized.replace(/(\d)\s+(\d)/g, '$1 $2')
  }

  if (removeWhitespace) {
    // Remove unnecessary whitespace
    optimized = optimized.replace(/\s+/g, ' ')
    optimized = optimized.replace(/>\s+</g, '><')
    optimized = optimized.replace(/\s*=\s*/g, '=')
    optimized = optimized.replace(/"\s+/g, '" ')
    optimized = optimized.trim()
  }

  return optimized
}

export function addPowerAppsAttributes(svgContent) {
  // Ensure the SVG has attributes that work well with Power Apps
  let enhanced = svgContent

  // Add preserveAspectRatio if not present
  if (!enhanced.includes('preserveAspectRatio')) {
    enhanced = enhanced.replace('<svg', '<svg preserveAspectRatio="xMidYMid meet"')
  }

  // Ensure viewBox is present for proper scaling
  if (!enhanced.includes('viewBox')) {
    const widthMatch = enhanced.match(/width="(\d+)"/i)
    const heightMatch = enhanced.match(/height="(\d+)"/i)
    
    if (widthMatch && heightMatch) {
      const width = widthMatch[1]
      const height = heightMatch[1]
      enhanced = enhanced.replace('<svg', `<svg viewBox="0 0 ${width} ${height}"`)
    }
  }

  // Add xmlns if not present
  if (!enhanced.includes('xmlns=')) {
    enhanced = enhanced.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
  }

  return enhanced
}

export function validateSvg(svgContent) {
  const errors = []
  const warnings = []

  // Check if it's valid SVG
  if (!svgContent.includes('<svg')) {
    errors.push('Content does not appear to be valid SVG')
    return { isValid: false, errors, warnings }
  }

  // Check for common issues
  if (!svgContent.includes('xmlns=')) {
    warnings.push('SVG missing xmlns attribute')
  }

  if (!svgContent.includes('viewBox=') && !svgContent.includes('width=')) {
    warnings.push('SVG missing both viewBox and width attributes')
  }

  // Check file size
  const sizeInBytes = new Blob([svgContent]).size
  if (sizeInBytes > 500000) { // 500KB
    warnings.push('SVG file is quite large (>500KB), consider optimizing further')
  }

  // Check for potential Power Apps issues
  if (svgContent.includes('foreignObject')) {
    warnings.push('SVG contains foreignObject which may not work in Power Apps')
  }

  if (svgContent.includes('<script')) {
    errors.push('SVG contains script tags which are not allowed in Power Apps')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    size: sizeInBytes
  }
}

export function getSvgDimensions(svgContent) {
  const widthMatch = svgContent.match(/width="([^"]+)"/i)
  const heightMatch = svgContent.match(/height="([^"]+)"/i)
  const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/i)

  let width = null
  let height = null

  if (widthMatch) {
    width = parseFloat(widthMatch[1])
  }

  if (heightMatch) {
    height = parseFloat(heightMatch[1])
  }

  // If no width/height, try to get from viewBox
  if ((!width || !height) && viewBoxMatch) {
    const viewBoxValues = viewBoxMatch[1].split(/\s+/)
    if (viewBoxValues.length >= 4) {
      width = width || parseFloat(viewBoxValues[2])
      height = height || parseFloat(viewBoxValues[3])
    }
  }

  return { width, height }
}
