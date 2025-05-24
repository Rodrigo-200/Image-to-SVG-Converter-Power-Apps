import { ref, reactive } from 'vue'

export function useImageConversion() {
  const isProcessing = ref(false)
  const processingProgress = ref(0)
  const error = ref('')
  const svgResult = ref('')

  const convertImageToSvg = async (imageFile, settings = {}) => {
    if (!imageFile) {
      throw new Error('No image file provided')
    }

    isProcessing.value = true
    processingProgress.value = 0
    error.value = ''
    svgResult.value = ''

    try {
      // Create canvas for image processing
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      return new Promise((resolve, reject) => {
        img.onload = async () => {
          try {
            processingProgress.value = 20

            // Set canvas dimensions
            canvas.width = img.naturalWidth
            canvas.height = img.naturalHeight
            
            // Draw image to canvas
            ctx.drawImage(img, 0, 0)
            processingProgress.value = 40

            // Process image based on settings
            let processedCanvas = canvas
            
            if (settings.removeBorder) {
              processedCanvas = await removeBorders(canvas, ctx)
              processingProgress.value = 60
            }

            // Convert to SVG
            const svgContent = await createSvgFromCanvas(processedCanvas, settings)
            processingProgress.value = 80

            // Optimize SVG
            const optimizedSvg = optimizeSvg(svgContent, settings)
            processingProgress.value = 100

            // Store result
            svgResult.value = optimizedSvg

            setTimeout(() => {
              isProcessing.value = false
              processingProgress.value = 0
            }, 500)

            resolve(optimizedSvg)
          } catch (err) {
            isProcessing.value = false
            processingProgress.value = 0
            error.value = err.message
            reject(err)
          }
        }

        img.onerror = () => {
          isProcessing.value = false
          processingProgress.value = 0
          error.value = 'Failed to load image'
          reject(new Error('Failed to load image'))
        }

        img.src = URL.createObjectURL(imageFile)
      })
    } catch (err) {
      isProcessing.value = false
      processingProgress.value = 0
      error.value = err.message
      throw err
    }
  }

  const removeBorders = async (canvas, ctx) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // Find the bounding box of non-transparent/non-white pixels
    let minX = canvas.width
    let minY = canvas.height
    let maxX = 0
    let maxY = 0

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const index = (y * canvas.width + x) * 4
        const r = data[index]
        const g = data[index + 1]
        const b = data[index + 2]
        const a = data[index + 3]

        // Check if pixel is not white/transparent (with some tolerance)
        const isSignificant = a > 10 && (r < 250 || g < 250 || b < 250)

        if (isSignificant) {
          minX = Math.min(minX, x)
          minY = Math.min(minY, y)
          maxX = Math.max(maxX, x)
          maxY = Math.max(maxY, y)
        }
      }
    }

    // Add small padding
    const padding = 2
    minX = Math.max(0, minX - padding)
    minY = Math.max(0, minY - padding)
    maxX = Math.min(canvas.width - 1, maxX + padding)
    maxY = Math.min(canvas.height - 1, maxY + padding)

    // Create new canvas with cropped dimensions
    const croppedCanvas = document.createElement('canvas')
    const croppedCtx = croppedCanvas.getContext('2d')
    
    const width = maxX - minX + 1
    const height = maxY - minY + 1
    
    croppedCanvas.width = width
    croppedCanvas.height = height
    
    // Draw cropped image
    croppedCtx.drawImage(
      canvas,
      minX, minY, width, height,
      0, 0, width, height
    )

    return croppedCanvas
  }

  const createSvgFromCanvas = async (canvas, settings) => {
    const width = canvas.width
    const height = canvas.height

    // Apply size settings
    let finalWidth = width
    let finalHeight = height

    switch (settings.size) {
      case 'small':
        finalWidth = finalHeight = 64
        break
      case 'medium':
        finalWidth = finalHeight = 128
        break
      case 'large':
        finalWidth = finalHeight = 256
        break
      case 'auto':
      default:
        // Keep original dimensions
        break
    }

    if (settings.svgColor && settings.svgColor !== '#000000') {
      // Convert to single color SVG
      return createColorSvg(canvas, settings.svgColor, finalWidth, finalHeight)
    } else {
      // Create SVG with embedded image
      const dataUrl = canvas.toDataURL('image/png')
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${finalWidth}" height="${finalHeight}" viewBox="0 0 ${width} ${height}">
        <image href="${dataUrl}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet"/>
      </svg>`
    }
  }

  const createColorSvg = (canvas, color, width, height) => {
    const ctx = canvas.getContext('2d')
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // Create path data from significant pixels
    const paths = []
    const threshold = 128 // Threshold for considering a pixel significant

    for (let y = 0; y < canvas.height; y += 2) { // Skip every other pixel for performance
      for (let x = 0; x < canvas.width; x += 2) {
        const index = (y * canvas.width + x) * 4
        const r = data[index]
        const g = data[index + 1]
        const b = data[index + 2]
        const a = data[index + 3]

        // Calculate brightness
        const brightness = (r + g + b) / 3
        
        if (a > 10 && brightness < threshold) {
          paths.push(`M${x},${y}h2v2h-2z`)
        }
      }
    }

    const pathData = paths.join('')
    
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${canvas.width} ${canvas.height}">
      <path d="${pathData}" fill="${color}"/>
    </svg>`
  }

  const optimizeSvg = (svgContent, settings) => {
    // Basic SVG optimization
    let optimized = svgContent
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/>\s+</g, '><') // Remove whitespace between tags
      .replace(/\s*=\s*/g, '=') // Remove spaces around equals
      .replace(/"\s+/g, '" ') // Clean up attribute spacing
      .trim()

    // Add Power Apps specific attributes
    if (!optimized.includes('preserveAspectRatio')) {
      optimized = optimized.replace('<svg', '<svg preserveAspectRatio="xMidYMid meet"')
    }    return optimized
  }

  return {
    isProcessing,
    processingProgress,
    error,
    svgResult,
    convertImageToSvg
  }
}
