/**
 * Image to SVG Converter Power Apps - Image Conversion Composable
 * Educational Project - Copyright (c) 2025 [Your Name]
 * Licensed under Educational & Personal Use License - see LICENSE file
 * 
 * This composable demonstrates Vue.js composition patterns, reactive state management,
 * image processing techniques, and modern JavaScript async/await patterns.
 * 
 * Key learning concepts:
 * - Vue 3 Composition API and reactive references
 * - Canvas-based image manipulation and processing
 * - HTTP client patterns and error handling
 * - Performance optimization and cancellable operations
 * 
 * Educational use encouraged with proper attribution.
 * Commercial use requires explicit permission.
 */

import { ref } from 'vue'
import { optimizeImageForProcessing, getOptimalProcessingSettings, createCancellableOperation, PerformanceMonitor } from '../utils/performance.js'

// Dynamic backend URL based on current location and environment
const getBackendUrl = () => {
  const currentHost = window.location.hostname
  const currentProtocol = window.location.protocol
  const currentPort = window.location.port
  
  // Check if this is a local development environment
  const isLocalDev = 
    currentHost === 'localhost' || 
    currentHost === '127.0.0.1' || 
    currentHost.startsWith('192.168.') || 
    currentHost.startsWith('10.') || 
    currentHost.startsWith('172.16.') ||
    currentPort === '5173' // Vite default port
  
  // If running in development (localhost or local network)
  if (isLocalDev) {
    // Always return localhost for development - we'll handle mobile access in the connection check
    return 'http://localhost:3001'
  }
  
  // If running in production (Vercel or other hosting)
  if (currentHost.includes('vercel.app') || currentHost.includes('vercel.dev')) {
    return `${currentProtocol}//${currentHost}/api`
  }
  
  // For other production hosts, use /api prefix
  return `${currentProtocol}//${currentHost}/api`
}

// Get possible backend URLs for development (with fallbacks for mobile access)
const getBackendUrls = () => {
  const currentHost = window.location.hostname
  const currentProtocol = window.location.protocol
  const urls = []
  
  // Primary URL
  urls.push(getBackendUrl())
  
  // If accessing via IP address, also try backend on the same IP
  if (currentHost.match(/^(\d+\.){3}\d+$/)) {
    urls.push(`${currentProtocol}//${currentHost}:3001`)
  }
  
  return urls
}

let BACKEND_URL = getBackendUrl()

console.log('🔗 Backend URL configured:', BACKEND_URL)

export function useImageConversion() {
  const isProcessing = ref(false)
  const processingProgress = ref(0)
  const error = ref('')
  const svgResult = ref('')
  const livePreviewSvg = ref('')
  const isBackendConnected = ref(false)
  
  // Performance optimization
  const perfSettings = getOptimalProcessingSettings()
  const activeOperations = new Set()
  
  // Cancel all active operations
  const cancelActiveOperations = () => {
    activeOperations.forEach(operation => operation.cancel())
    activeOperations.clear()
  }
  
  // Check if backend is available
  const checkBackendConnection = async () => {
    const backendUrls = getBackendUrls()
    
    for (const url of backendUrls) {
      try {
        console.log(`🔍 Trying backend URL: ${url}`)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout
        
        const response = await fetch(`${url}/health`, {
          signal: controller.signal
        })
        clearTimeout(timeoutId)
        
        const result = await response.json()
        if (result.status === 'healthy' || result.status === 'OK') {
          // Update the BACKEND_URL to the working one
          BACKEND_URL = url
          isBackendConnected.value = true
          console.log('✅ Backend connection established:', result, 'URL:', url)
          return true
        }
      } catch (err) {
        console.log(`❌ Backend not reachable at ${url}:`, err.message)
      }
    }
    
    console.log('ℹ️ Backend not available on any URL - running in frontend-only mode')
    console.log('💡 To enable backend features, run: npm run dev:full')
    isBackendConnected.value = false
    return false
  }

  // Helper function to detect borders that would be removed
  const detectBorders = (imageData, width, height) => {
    const data = imageData.data
    const borderThreshold = 220 // Lower threshold for better detection (was 240)
    
    console.log('🔍 Starting border detection...', {
      width,
      height,
      threshold: borderThreshold,
      dataLength: data.length
    })
    
    // Detect top border
    let topBorder = 0
    for (let y = 0; y < height; y++) {
      let isEmptyRow = true
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4
        const r = data[idx], g = data[idx + 1], b = data[idx + 2]
        const brightness = (r + g + b) / 3
        if (brightness < borderThreshold) {
          isEmptyRow = false
          break
        }
      }
      if (!isEmptyRow) break
      topBorder = y + 1
    }

    // Detect bottom border
    let bottomBorder = 0
    for (let y = height - 1; y >= 0; y--) {
      let isEmptyRow = true
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4
        const r = data[idx], g = data[idx + 1], b = data[idx + 2]
        const brightness = (r + g + b) / 3
        if (brightness < borderThreshold) {
          isEmptyRow = false
          break
        }
      }
      if (!isEmptyRow) break
      bottomBorder = height - y
    }

    // Detect left border
    let leftBorder = 0
    for (let x = 0; x < width; x++) {
      let isEmptyCol = true
      for (let y = 0; y < height; y++) {
        const idx = (y * width + x) * 4
        const r = data[idx], g = data[idx + 1], b = data[idx + 2]
        const brightness = (r + g + b) / 3
        if (brightness < borderThreshold) {
          isEmptyCol = false
          break
        }
      }
      if (!isEmptyCol) break
      leftBorder = x + 1
    }

    // Detect right border
    let rightBorder = 0
    for (let x = width - 1; x >= 0; x--) {
      let isEmptyCol = true
      for (let y = 0; y < height; y++) {
        const idx = (y * width + x) * 4
        const r = data[idx], g = data[idx + 1], b = data[idx + 2]
        const brightness = (r + g + b) / 3
        if (brightness < borderThreshold) {
          isEmptyCol = false
          break
        }
      }
      if (!isEmptyCol) break
      rightBorder = width - x    }

    const result = { top: topBorder, bottom: bottomBorder, left: leftBorder, right: rightBorder }
    console.log('🔍 Border detection complete:', result)
    console.log('🔍 Borders found:', result.top > 0 || result.bottom > 0 || result.left > 0 || result.right > 0)
    
    return result  }
  
  // Function to detect borders in image for backend use
  const detectImageBorders = async (imageFile) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      const url = URL.createObjectURL(imageFile)

      img.onload = () => {
        URL.revokeObjectURL(url) // Clean up blob URL

        // Use original image size for precise border detection
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight

        // Draw the image at full resolution
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        // Get image data for processing
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        
        // Detect borders using the same logic as preview
        const borders = detectBorders(imageData, canvas.width, canvas.height)
        
        console.log('🔍 Full resolution border detection:', {
          originalSize: `${canvas.width}x${canvas.height}`,
          borders,
          contentArea: {
            left: borders.left,
            top: borders.top,
            width: canvas.width - borders.left - borders.right,
            height: canvas.height - borders.top - borders.bottom
          }
        })
        
        resolve({
          originalWidth: canvas.width,
          originalHeight: canvas.height,
          borders,
          contentArea: {
            left: borders.left,
            top: borders.top,
            width: Math.max(1, canvas.width - borders.left - borders.right),
            height: Math.max(1, canvas.height - borders.top - borders.bottom)
          }
        })
      }

      img.onerror = () => {
        URL.revokeObjectURL(url) // Clean up blob URL even on error
        console.error('Failed to load image for border detection')
        resolve(null)
      }

      img.src = url
    })
  }
  // Live preview function - creates image-like SVG preview with visible border detection
  const updateLivePreview = async (imageFile, settings = {}) => {
    if (!imageFile) {
      livePreviewSvg.value = ''
      return
    }

    // Cancel any existing preview operations
    cancelActiveOperations()
    
    const operation = createCancellableOperation()
    activeOperations.add(operation)
    
    const monitor = new PerformanceMonitor('live-preview')
    monitor.start()

    try {
      // Optimize image for processing based on device capabilities
      const canvas = await optimizeImageForProcessing(imageFile, {
        maxWidth: perfSettings.maxImageSize,
        maxHeight: perfSettings.maxImageSize,
        forMobile: perfSettings.maxImageSize <= 400
      })
      
      monitor.mark('image-optimized')
      
      // Check if operation was cancelled
      if (operation.signal.aborted) {
        activeOperations.delete(operation)
        return
      }

      const ctx = canvas.getContext('2d')
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
      
      monitor.mark('image-data-extracted')
      
      // Detect borders if removeBorder is enabled (optimized for mobile)
      const borders = settings.removeBorder ? detectBorders(ctx.getImageData(0, 0, canvas.width, canvas.height), canvas.width, canvas.height) : 
                     { top: 0, bottom: 0, left: 0, right: 0 }
      
      monitor.mark('borders-detected')

      // Check if operation was cancelled before heavy processing
      if (operation.signal.aborted) {
        activeOperations.delete(operation)
        return
      }

      // Calculate content area after border removal
      const contentLeft = borders.left
      const contentTop = borders.top
      const contentWidth = canvas.width - borders.left - borders.right
      const contentHeight = canvas.height - borders.top - borders.bottom

      // Create image-like SVG with simplified vectorization (optimized pixel size for mobile)
      const pixelSize = perfSettings.maxImageSize <= 400 ? 4 : 2 // Larger pixels for mobile performance
      const svgColor = settings.svgColor || '#000000'
      let svgContent = ''
      
      // Add definitions for border visualization - make orange more visible
      svgContent += `<defs>
        <pattern id="borderHighlight" patternUnits="userSpaceOnUse" width="8" height="8">
          <rect width="8" height="8" fill="rgba(255, 152, 0, 0.4)"/>
          <rect width="4" height="4" fill="rgba(255, 152, 0, 0.8)"/>
          <rect x="4" y="4" width="4" height="4" fill="rgba(255, 152, 0, 0.8)"/>
        </pattern>
      </defs>\n`

      // Show border areas if removeBorder is enabled
      if (settings.removeBorder && (borders.top > 0 || borders.bottom > 0 || borders.left > 0 || borders.right > 0)) {
        // Add border overlay rectangles - more visible orange
        if (borders.top > 0) {
          svgContent += `<rect x="0" y="0" width="${canvas.width}" height="${borders.top}" fill="rgba(255, 152, 0, 0.6)" stroke="#ff9800" stroke-width="2" stroke-dasharray="4,2"/>\n`
        }
        if (borders.bottom > 0) {
          svgContent += `<rect x="0" y="${canvas.height - borders.bottom}" width="${canvas.width}" height="${borders.bottom}" fill="rgba(255, 152, 0, 0.6)" stroke="#ff9800" stroke-width="2" stroke-dasharray="4,2"/>\n`
        }
        if (borders.left > 0) {
          svgContent += `<rect x="0" y="0" width="${borders.left}" height="${canvas.height}" fill="rgba(255, 152, 0, 0.6)" stroke="#ff9800" stroke-width="2" stroke-dasharray="4,2"/>\n`
        }
        if (borders.right > 0) {
          svgContent += `<rect x="${canvas.width - borders.right}" y="0" width="${borders.right}" height="${canvas.height}" fill="rgba(255, 152, 0, 0.6)" stroke="#ff9800" stroke-width="2" stroke-dasharray="4,2"/>\n`
        }
      }

      // Create image-like representation with pixelated effect
      const processedPaths = []
      const bordersDetected = borders.top > 0 || borders.bottom > 0 || borders.left > 0 || borders.right > 0
      const showFullImageForBorders = settings.removeBorder && bordersDetected
      
      // Process image data to create simplified vector representation  
      const processStartX = settings.removeBorder ? contentLeft : 0
      const processStartY = settings.removeBorder ? contentTop : 0
      const processEndX = settings.removeBorder ? contentLeft + contentWidth : canvas.width
      const processEndY = settings.removeBorder ? contentTop + contentHeight : canvas.height
      
      // Process in chunks to avoid blocking main thread on mobile
      const processChunk = (startY, endY) => {
        for (let y = startY; y < endY && y < processEndY; y += pixelSize) {
          for (let x = processStartX; x < processEndX; x += pixelSize) {
            if (x >= canvas.width || y >= canvas.height) continue
            
            const idx = (y * canvas.width + x) * 4
            const r = data[idx]
            const g = data[idx + 1]
            const b = data[idx + 2]
            const a = data[idx + 3]
            
            // Skip transparent or very light pixels
            if (a < 50) continue
            
            const brightness = (r + g + b) / 3
            if (brightness > 240) continue
            
            // Create opacity based on brightness for depth
            const opacity = Math.max(0.2, 1 - (brightness / 255))
            
            // When showing borders, use original coordinates
            const finalX = showFullImageForBorders ? x : (settings.removeBorder ? x - contentLeft : x)
            const finalY = showFullImageForBorders ? y : (settings.removeBorder ? y - contentTop : y)
            
            processedPaths.push(`<rect x="${finalX}" y="${finalY}" width="${pixelSize}" height="${pixelSize}" fill="${svgColor}" opacity="${opacity.toFixed(2)}"/>`)
          }
        }
      }

      // Process image in chunks for better performance
      const chunkSize = perfSettings.maxImageSize <= 400 ? 10 : 20
      for (let y = processStartY; y < processEndY; y += chunkSize) {
        if (operation.signal.aborted) {
          activeOperations.delete(operation)
          return
        }
        processChunk(y, Math.min(y + chunkSize, processEndY))
      }

      monitor.mark('svg-content-generated')

      // Add the image content
      svgContent += processedPaths.join('\n')
      const viewBoxWidth = showFullImageForBorders ? canvas.width : (settings.removeBorder ? Math.max(1, contentWidth) : canvas.width)
      const viewBoxHeight = showFullImageForBorders ? canvas.height : (settings.removeBorder ? Math.max(1, contentHeight) : canvas.height)

      const previewSvg = `<svg width="100%" height="100%" viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}" xmlns="http://www.w3.org/2000/svg">
        ${svgContent}
      </svg>`

      livePreviewSvg.value = previewSvg
      monitor.end()
      activeOperations.delete(operation)
      
    } catch (err) {
      console.error('Live preview error:', err)
      livePreviewSvg.value = ''
      activeOperations.delete(operation)
    }
  }// Main conversion function using backend
  const convertImageToSvg = async (imageFile, settings = {}, options = {}) => {
    if (!imageFile) {
      throw new Error('No image file provided')
    }

    // Check backend connection first
    const connected = await checkBackendConnection()
    if (!connected) {
      throw new Error('High-quality backend conversion is not available. Please run "npm run dev:full" to start the backend server, or use the live preview as an alternative.')
    }

    // Only set processing state if not part of a batch operation
    const isBatchOperation = options.isBatchOperation || false
    if (!isBatchOperation) {
      isProcessing.value = true
      processingProgress.value = 0
    }    
    error.value = ''
    svgResult.value = ''

    try {
      console.log('🚀 Starting backend conversion...')
      if (!isBatchOperation) {
        processingProgress.value = 10
      }

      // Detect borders if border removal is enabled
      let borderData = null
      if (settings.removeBorder) {
        console.log('🔍 Detecting borders for precise removal...')
        borderData = await detectImageBorders(imageFile)
        if (borderData) {
          console.log('🔍 Border data for backend:', borderData)
        }
        if (!isBatchOperation) {
          processingProgress.value = 20
        }
      }

      // Prepare form data
      const formData = new FormData()
      formData.append('image', imageFile)
      formData.append('removeBorder', settings.removeBorder ? 'true' : 'false')
      formData.append('svgColor', settings.svgColor || '#000000')
      formData.append('size', settings.size || 'auto')
      formData.append('quality', settings.quality || 'high')
      
      // Pass border data for precise cropping
      if (borderData) {
        formData.append('borderData', JSON.stringify(borderData))
      }

      console.log('📤 Sending to backend with settings:', {
        removeBorder: settings.removeBorder,
        svgColor: settings.svgColor,
        size: settings.size,
        quality: settings.quality,
        hasBorderData: !!borderData
      })

      if (!isBatchOperation) {
        processingProgress.value = 35
      }      // Send to backend
      const response = await fetch(`${BACKEND_URL}/convert-to-svg`, {
        method: 'POST',
        body: formData
      })

      if (!isBatchOperation) {
        processingProgress.value = 75
      }

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      processingProgress.value = 90

      if (!result.success) {
        throw new Error(result.error || 'Conversion failed')
      }

      console.log('✅ Backend conversion successful!')
      console.log('📊 Original size:', result.originalSize)
      console.log('📊 SVG size:', result.svgSize)      // Store result
      svgResult.value = result.svg
      livePreviewSvg.value = result.svg
      
      // Only update progress to 100% and reset processing state if not part of batch operation
      if (!isBatchOperation) {
        processingProgress.value = 100
        // Reset progress after a delay
        setTimeout(() => {
          isProcessing.value = false
          processingProgress.value = 0
        }, 1000)
      }

      return result.svg

    } catch (err) {
      console.error('❌ Conversion error:', err)
      // Only reset processing state if not part of batch operation
      if (!isBatchOperation) {
        isProcessing.value = false
        processingProgress.value = 0
      }
      error.value = err.message
      throw err
    }
  }  // Simple color change for existing SVG (lightweight operation)
  const changeSvgColor = (svgString, newColor) => {
    if (!svgString || !newColor) return svgString
    
    return svgString
      .replace(/fill="[^"]*"/g, `fill="${newColor}"`)
      .replace(/stroke="[^"]*"/g, `stroke="${newColor}"`)
  }

  // Download SVG function
  const downloadSvg = (svgContent, filename = 'converted-image.svg') => {
    if (!svgContent) {
      throw new Error('No SVG content to download')
    }

    // Ensure SVG has proper XML declaration for better browser compatibility
    let finalSvgContent = svgContent
    if (!finalSvgContent.startsWith('<?xml')) {
      finalSvgContent = '<?xml version="1.0" encoding="UTF-8"?>\n' + finalSvgContent
    }

    // Create blob with proper MIME type
    const blob = new Blob([finalSvgContent], { 
      type: 'image/svg+xml;charset=utf-8' 
    })
    const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up blob URL
    setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 100)
  }
  // Get current backend URL for debugging
  const getCurrentBackendUrl = () => {
    return BACKEND_URL
  }  // Initialize backend connection check
  checkBackendConnection()

  // Cleanup function for when component unmounts
  const cleanup = () => {
    cancelActiveOperations()
  }

  return {
    isProcessing,
    processingProgress,
    error,
    svgResult,
    livePreviewSvg,
    isBackendConnected,
    convertImageToSvg,
    updateLivePreview,
    changeSvgColor,
    downloadSvg,
    checkBackendConnection,
    getCurrentBackendUrl,
    cleanup,
    cancelActiveOperations
  }
}
