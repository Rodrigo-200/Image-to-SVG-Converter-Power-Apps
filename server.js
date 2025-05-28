import express from 'express'
import multer from 'multer'
import sharp from 'sharp'
import potrace from 'potrace'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { promisify } from 'util'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const port = 3001

// Configure CORS to allow frontend to access the backend from any device
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost in any format
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Allow any IP address on the local network (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
    const localNetworkRegex = /^https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)[\d.]+:\d+$/;
    if (localNetworkRegex.test(origin)) {
      return callback(null, true);
    }
    
    // For development, allow any origin (you can restrict this in production)
    return callback(null, true);
  },
  credentials: true
}))

app.use(express.json({ limit: '1gb' }))
app.use(express.urlencoded({ extended: true, limit: '1gb' }))

// Configure multer for file uploads
const storage = multer.memoryStorage()
const upload = multer({ 
  storage,
  limits: {
    fileSize: 1024 * 1024 * 1024 // 1GB limit
  }
})

// Promisify potrace functions
const trace = promisify(potrace.trace)

// Convert image to SVG endpoint
app.post('/convert-to-svg', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' })
    }    console.log('🎯 Converting image to SVG...')
    console.log('📄 Original file size:', req.file.size)
    console.log('⚙️ Options:', req.body)

    const { removeBorder, svgColor, size, quality, borderData } = req.body
    let imageBuffer = req.file.buffer

    // Process image with Sharp for better quality
    let sharpImage = sharp(imageBuffer)
    
    // Get original metadata
    const metadata = await sharpImage.metadata()
    console.log('📏 Original dimensions:', metadata.width, 'x', metadata.height)

    // Remove border if requested - use precise border data if available
    if (removeBorder === 'true') {
      if (borderData) {
        try {
          const borders = JSON.parse(borderData)
          console.log('🔍 Using precise border data:', borders)
            // Calculate extraction area based on precise border detection
          const left = borders.contentArea.x
          const top = borders.contentArea.y
          const width = Math.max(1, borders.contentArea.width)
          const height = Math.max(1, borders.contentArea.height)
          
          console.log('✂️ Extracting area:', { left, top, width, height })
          
          // Use Sharp's extract method for precise pixel-perfect cropping
          sharpImage = sharpImage.extract({
            left: left,
            top: top,
            width: width,
            height: height
          })
          console.log('✅ Precise border removal applied using frontend detection')
        } catch (err) {
          console.warn('⚠️ Failed to parse border data, falling back to basic trim:', err.message)
          // Fallback to basic trim
          sharpImage = sharpImage.trim({
            background: '#ffffff',
            threshold: 10
          })
          console.log('✂️ Basic border removal applied (fallback)')
        }
      } else {
        // Fallback to basic trim when no border data is provided
        sharpImage = sharpImage.trim({
          background: '#ffffff',
          threshold: 10
        })
        console.log('✂️ Basic border removal applied (no border data)')
      }
    }

    // Resize if needed
    if (size && size !== 'auto') {
      const sizeMap = {
        small: 128,
        medium: 256,
        large: 512
      }
      const targetSize = sizeMap[size] || 256
      sharpImage = sharpImage.resize(targetSize, targetSize, { 
        fit: 'inside',
        withoutEnlargement: false 
      })
      console.log('🔧 Resized to:', targetSize + 'px')
    }

    // Enhance image for better vectorization
    sharpImage = sharpImage
      .normalize() // Auto-adjust levels
      .modulate({
        brightness: 1.1,
        saturation: 1.2
      })

    // Convert to high-quality bitmap for tracing
    const processedBuffer = await sharpImage
      .png({ quality: 100, compressionLevel: 0 })
      .toBuffer()

    console.log('🔄 Processing with Potrace...')

    // Use Potrace for true vectorization with promisified version
    const traceOptions = {
      threshold: quality === 'high' ? 128 : 160,
      optTolerance: quality === 'high' ? 0.2 : 0.4,
      turnPolicy: potrace.Potrace.TURNPOLICY_MINORITY,
      alphaMax: quality === 'high' ? 1.0 : 1.3,
      optCurve: true,
      color: svgColor && svgColor !== '#000000' ? svgColor : '#000000',
      background: 'transparent'
    }

    // Convert to SVG using Potrace (promisified)
    const svg = await trace(processedBuffer, traceOptions)    // Clean up and optimize the SVG
    let optimizedSvg = svg
      .replace(/width="[^"]*"/, `width="100%"`)
      .replace(/height="[^"]*"/, `height="100%"`)
      .replace(/<svg/, '<svg preserveAspectRatio="xMidYMid meet"')

    // Apply color if specified and different from black
    if (svgColor && svgColor !== '#000000') {
      optimizedSvg = optimizedSvg.replace(/fill="[^"]*"/g, `fill="${svgColor}"`)
      optimizedSvg = optimizedSvg.replace(/stroke="[^"]*"/g, `stroke="${svgColor}"`)
      console.log('🎨 Applied color:', svgColor)
    }

    // Remove unnecessary whitespace and comments, but preserve structure
    optimizedSvg = optimizedSvg
      .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
      .replace(/\s+/g, ' ') // Minimize whitespace
      .replace(/>\s+</g, '><') // Remove spaces between tags
      .trim()

    // Ensure SVG starts properly (no leading whitespace or invalid characters)
    optimizedSvg = optimizedSvg.replace(/^[^\<]*/, '') // Remove any non-tag content at the start
    
    // Validate that we have a proper SVG
    if (!optimizedSvg.startsWith('<svg')) {
      throw new Error('Generated content is not a valid SVG')
    }

    console.log('✅ Conversion complete!')
    console.log('📊 SVG size:', optimizedSvg.length, 'characters')
    console.log('📋 SVG starts with:', optimizedSvg.substring(0, 50) + '...')

    res.json({ 
      success: true,
      svg: optimizedSvg,
      originalSize: req.file.size,
      svgSize: optimizedSvg.length,
      metadata: {
        originalWidth: metadata.width,
        originalHeight: metadata.height,
        format: metadata.format
      }
    })

  } catch (error) {
    console.error('❌ Conversion error:', error)
    res.status(500).json({ 
      success: false,
      error: error.message || 'Internal server error' 
    })
  }
})

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('📊 Health check requested from:', req.ip)
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// API routes for Vercel deployment (with /api prefix)
// Health check endpoint for API
app.get('/api/health', (req, res) => {
  console.log('📊 API Health check requested from:', req.ip)
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Convert image to SVG endpoint for API (same logic as main endpoint)
app.post('/api/convert-to-svg', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' })
    }

    console.log('🎯 Converting image to SVG via API...')
    console.log('📄 Original file size:', req.file.size)
    console.log('⚙️ Options:', req.body)

    const { removeBorder, svgColor, size, quality } = req.body
    let imageBuffer = req.file.buffer

    // Process image with Sharp for better quality
    let sharpImage = sharp(imageBuffer)
    
    // Get original metadata
    const metadata = await sharpImage.metadata()
    console.log('📏 Original dimensions:', metadata.width, 'x', metadata.height)

    // Remove border if requested
    if (removeBorder === 'true') {
      sharpImage = sharpImage.trim({
        background: '#ffffff',
        threshold: 10
      })
      console.log('✂️ Border removal applied')
    }

    // Resize if needed
    if (size && size !== 'auto') {
      const sizeMap = {
        small: 128,
        medium: 256,
        large: 512
      }
      const targetSize = sizeMap[size] || 256
      sharpImage = sharpImage.resize(targetSize, targetSize, { 
        fit: 'inside',
        withoutEnlargement: false 
      })
      console.log('🔧 Resized to:', targetSize + 'px')
    }

    // Enhance image for better vectorization
    sharpImage = sharpImage
      .normalize()
      .modulate({
        brightness: 1.1,
        saturation: 1.2
      })

    // Convert to high-quality bitmap for tracing
    const processedBuffer = await sharpImage
      .png({ quality: 100, compressionLevel: 0 })
      .toBuffer()

    console.log('🔄 Processing with Potrace via API...')

    // Use Potrace for true vectorization
    const traceOptions = {
      threshold: quality === 'high' ? 128 : 160,
      optTolerance: quality === 'high' ? 0.2 : 0.4,
      turnPolicy: potrace.Potrace.TURNPOLICY_MINORITY,
      alphaMax: quality === 'high' ? 1.0 : 1.3,
      optCurve: true,
      color: svgColor && svgColor !== '#000000' ? svgColor : '#000000',
      background: 'transparent'
    }

    const svg = await trace(processedBuffer, traceOptions)

    // Clean up and optimize the SVG
    let optimizedSvg = svg
      .replace(/width="[^"]*"/, `width="100%"`)
      .replace(/height="[^"]*"/, `height="100%"`)
      .replace(/<svg/, '<svg preserveAspectRatio="xMidYMid meet"')

    // Apply color if specified
    if (svgColor && svgColor !== '#000000') {
      optimizedSvg = optimizedSvg.replace(/fill="[^"]*"/g, `fill="${svgColor}"`)
      optimizedSvg = optimizedSvg.replace(/stroke="[^"]*"/g, `stroke="${svgColor}"`)
      console.log('🎨 Applied color:', svgColor)
    }

    // Remove unnecessary whitespace and comments
    optimizedSvg = optimizedSvg
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .trim()

    optimizedSvg = optimizedSvg.replace(/^[^\<]*/, '')
    
    // Validate SVG
    if (!optimizedSvg.startsWith('<svg')) {
      throw new Error('Generated content is not a valid SVG')
    }

    console.log('✅ API Conversion complete!')
    console.log('📊 SVG size:', optimizedSvg.length, 'characters')

    res.json({ 
      success: true,
      svg: optimizedSvg,
      originalSize: req.file.size,
      svgSize: optimizedSvg.length,
      metadata: {
        originalWidth: metadata.width,
        originalHeight: metadata.height,
        format: metadata.format
      }
    })

  } catch (error) {
    console.error('❌ API Conversion error:', error)
    res.status(500).json({ 
      success: false,
      error: error.message || 'Internal server error' 
    })
  }
})

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 SVG Conversion Server running at http://localhost:${port}`)
  console.log(`📱 Network access: http://YOUR_IP:${port}`)
  console.log(`📡 CORS enabled for http://localhost:5173-5177`)
  console.log(`🎯 Ready to convert images to SVG with Potrace!`)
})
