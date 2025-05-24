import { ref } from 'vue'

const BACKEND_URL = 'http://localhost:3001'

export function useImageConversion() {
  const isProcessing = ref(false)
  const processingProgress = ref(0)
  const error = ref('')
  const svgResult = ref('')
  const livePreviewSvg = ref('')
  const isBackendConnected = ref(false)

  // Check if backend is available
  const checkBackendConnection = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/health`)
      const result = await response.json()
      isBackendConnected.value = result.status === 'OK'
      return isBackendConnected.value
    } catch (err) {
      console.error('Backend connection failed:', err)
      isBackendConnected.value = false
      return false
    }
  }  // Helper function to detect borders that would be removed
  const detectBorders = (imageData, width, height) => {
    const data = imageData.data
    const borderThreshold = 240 // Light colors considered as border
    
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
      rightBorder = width - x
    }

    return { top: topBorder, bottom: bottomBorder, left: leftBorder, right: rightBorder }
  }
  // Live preview function - creates image-like SVG preview with visible border detection
  const updateLivePreview = async (imageFile, settings = {}) => {
    if (!imageFile) {
      livePreviewSvg.value = ''
      return
    }

    try {
      // Create canvas for image processing
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      const url = URL.createObjectURL(imageFile)

      return new Promise((resolve) => {
        img.onload = () => {
          URL.revokeObjectURL(url) // Clean up blob URL

          // Set canvas size for preview (optimized for performance vs quality)
          const maxSize = 150 // Smaller for better performance
          const scale = Math.min(maxSize / img.naturalWidth, maxSize / img.naturalHeight)
          canvas.width = img.naturalWidth * scale
          canvas.height = img.naturalHeight * scale

          // Draw the image
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

          // Get image data for processing
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const data = imageData.data

          // Detect borders if removeBorder is enabled
          const borders = settings.removeBorder ? detectBorders(imageData, canvas.width, canvas.height) : 
                         { top: 0, bottom: 0, left: 0, right: 0 }

          // Calculate content area after border removal
          const contentLeft = borders.left
          const contentTop = borders.top
          const contentWidth = canvas.width - borders.left - borders.right
          const contentHeight = canvas.height - borders.top - borders.bottom

          // Create image-like SVG with simplified vectorization
          const pixelSize = 2 // Larger pixels for lower quality but faster processing
          const svgColor = settings.svgColor || '#000000'
          let svgContent = ''
          
          // Add definitions for border visualization
          svgContent += `<defs>
            <pattern id="borderHighlight" patternUnits="userSpaceOnUse" width="8" height="8">
              <rect width="8" height="8" fill="none"/>
              <rect width="4" height="4" fill="rgba(255, 152, 0, 0.6)" opacity="0.8"/>
              <rect x="4" y="4" width="4" height="4" fill="rgba(255, 152, 0, 0.6)" opacity="0.8"/>
            </pattern>
            <pattern id="borderStroke" patternUnits="userSpaceOnUse" width="6" height="6">
              <rect width="6" height="6" fill="none"/>
              <rect width="3" height="3" fill="#ff9800"/>
              <rect x="3" y="3" width="3" height="3" fill="#ff9800"/>
            </pattern>
          </defs>\n`

          // Show border areas if removeBorder is enabled
          if (settings.removeBorder && (borders.top > 0 || borders.bottom > 0 || borders.left > 0 || borders.right > 0)) {
            // Top border
            if (borders.top > 0) {
              svgContent += `<rect x="0" y="0" width="${canvas.width}" height="${borders.top}" fill="url(#borderHighlight)" stroke="#ff9800" stroke-width="1" stroke-dasharray="3,2"/>\n`
            }
            // Bottom border
            if (borders.bottom > 0) {
              svgContent += `<rect x="0" y="${canvas.height - borders.bottom}" width="${canvas.width}" height="${borders.bottom}" fill="url(#borderHighlight)" stroke="#ff9800" stroke-width="1" stroke-dasharray="3,2"/>\n`
            }
            // Left border
            if (borders.left > 0) {
              svgContent += `<rect x="0" y="0" width="${borders.left}" height="${canvas.height}" fill="url(#borderHighlight)" stroke="#ff9800" stroke-width="1" stroke-dasharray="3,2"/>\n`
            }
            // Right border
            if (borders.right > 0) {
              svgContent += `<rect x="${canvas.width - borders.right}" y="0" width="${borders.right}" height="${canvas.height}" fill="url(#borderHighlight)" stroke="#ff9800" stroke-width="1" stroke-dasharray="3,2"/>\n`
            }
          }

          // Create image-like representation with pixelated effect (mimics conversion)
          const processedPaths = []
          
          // Process image data to create simplified vector representation
          for (let y = contentTop; y < contentTop + contentHeight; y += pixelSize) {
            for (let x = contentLeft; x < contentLeft + contentWidth; x += pixelSize) {
              if (x >= canvas.width || y >= canvas.height) continue
              
              const idx = (y * canvas.width + x) * 4
              const r = data[idx]
              const g = data[idx + 1]
              const b = data[idx + 2]
              const a = data[idx + 3]
              
              // Skip transparent or very light pixels
              if (a < 50) continue
              
              const brightness = (r + g + b) / 3
              if (brightness > 240) continue // Skip very light pixels
              
              // Create opacity based on brightness for depth
              const opacity = Math.max(0.2, 1 - (brightness / 255))
              
              // Adjust coordinates for content area only
              const adjustedX = x - contentLeft
              const adjustedY = y - contentTop
              
              processedPaths.push(`<rect x="${adjustedX}" y="${adjustedY}" width="${pixelSize}" height="${pixelSize}" fill="${svgColor}" opacity="${opacity.toFixed(2)}"/>`)
            }
          }

          // Add the image content
          svgContent += processedPaths.join('\n')

          // Set viewBox to content area or full image
          const viewBoxWidth = settings.removeBorder ? Math.max(1, contentWidth) : canvas.width
          const viewBoxHeight = settings.removeBorder ? Math.max(1, contentHeight) : canvas.height
          const viewBoxX = settings.removeBorder ? 0 : 0
          const viewBoxY = settings.removeBorder ? 0 : 0

          const previewSvg = `<svg width="100%" height="100%" viewBox="${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}" xmlns="http://www.w3.org/2000/svg">
            ${svgContent}
          </svg>`

          livePreviewSvg.value = previewSvg
          resolve()
        }

        img.onerror = () => {
          URL.revokeObjectURL(url) // Clean up blob URL even on error
          console.error('Failed to load image for live preview')
          livePreviewSvg.value = ''
          resolve()
        }

        img.src = url
      })
    } catch (err) {
      console.error('Live preview error:', err)
      livePreviewSvg.value = ''
    }
  }

  // Main conversion function using backend
  const convertImageToSvg = async (imageFile, settings = {}) => {
    if (!imageFile) {
      throw new Error('No image file provided')
    }

    // Check backend connection first
    const connected = await checkBackendConnection()
    if (!connected) {
      throw new Error('Backend server is not available. Please start the server with "npm run dev:full"')
    }

    isProcessing.value = true
    processingProgress.value = 0
    error.value = ''
    svgResult.value = ''

    try {
      console.log('🚀 Starting backend conversion...')
      processingProgress.value = 10

      // Prepare form data
      const formData = new FormData()
      formData.append('image', imageFile)
      formData.append('removeBorder', settings.removeBorder ? 'true' : 'false')
      formData.append('svgColor', settings.svgColor || '#000000')
      formData.append('size', settings.size || 'auto')
      formData.append('quality', settings.quality || 'high')

      console.log('📤 Sending to backend with settings:', {
        removeBorder: settings.removeBorder,
        svgColor: settings.svgColor,
        size: settings.size,
        quality: settings.quality
      })

      processingProgress.value = 30

      // Send to backend
      const response = await fetch(`${BACKEND_URL}/convert-to-svg`, {
        method: 'POST',
        body: formData
      })

      processingProgress.value = 70

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
      console.log('📊 SVG size:', result.svgSize)

      // Store result
      svgResult.value = result.svg
      livePreviewSvg.value = result.svg
      processingProgress.value = 100

      // Reset progress after a delay
      setTimeout(() => {
        isProcessing.value = false
        processingProgress.value = 0
      }, 1000)

      return result.svg

    } catch (err) {
      console.error('❌ Conversion error:', err)
      isProcessing.value = false
      processingProgress.value = 0
      error.value = err.message
      throw err
    }
  }

  // Simple color change for existing SVG (lightweight operation)
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

  // Initialize backend connection check
  checkBackendConnection()

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
    checkBackendConnection
  }
}
