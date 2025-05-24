import formidable from 'formidable';
import sharp from 'sharp';
import potrace from 'potrace';
import { promisify } from 'util';
import fs from 'fs';

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

const trace = promisify(potrace.trace);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🎯 Vercel: Converting image to SVG...');

    // Parse form data
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    
    const imageFile = files.image?.[0];
    if (!imageFile) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    console.log('📄 Original file size:', imageFile.size);

    // Get options from fields
    const removeBorder = fields.removeBorder?.[0] === 'true';
    const svgColor = fields.svgColor?.[0];
    const size = fields.size?.[0];
    const quality = fields.quality?.[0];

    console.log('⚙️ Options:', { removeBorder, svgColor, size, quality });

    // Read the uploaded file
    const imageBuffer = fs.readFileSync(imageFile.filepath);

    // Process image with Sharp
    let sharpImage = sharp(imageBuffer);
    
    // Get original metadata
    const metadata = await sharpImage.metadata();
    console.log('📏 Original dimensions:', metadata.width, 'x', metadata.height);

    // Remove border if requested
    if (removeBorder) {
      sharpImage = sharpImage.trim({
        background: '#ffffff',
        threshold: 10
      });
      console.log('✂️ Border removal applied');
    }

    // Resize if needed
    if (size && size !== 'auto') {
      const sizeMap = {
        small: 128,
        medium: 256,
        large: 512
      };
      const targetSize = sizeMap[size] || 256;
      sharpImage = sharpImage.resize(targetSize, targetSize, { 
        fit: 'inside',
        withoutEnlargement: false 
      });
      console.log('🔧 Resized to:', targetSize + 'px');
    }

    // Enhance image for better vectorization
    sharpImage = sharpImage
      .normalize()
      .modulate({
        brightness: 1.1,
        saturation: 1.2
      });

    // Convert to high-quality bitmap for tracing
    const processedBuffer = await sharpImage
      .png({ quality: 100, compressionLevel: 0 })
      .toBuffer();

    console.log('🔄 Processing with Potrace...');

    // Use Potrace for vectorization
    const traceOptions = {
      threshold: quality === 'high' ? 128 : 160,
      optTolerance: quality === 'high' ? 0.2 : 0.4,
      turnPolicy: potrace.Potrace.TURNPOLICY_MINORITY,
      alphaMax: quality === 'high' ? 1.0 : 1.3,
      optCurve: true,
      color: svgColor && svgColor !== '#000000' ? svgColor : '#000000',
      background: 'transparent'
    };

    const svg = await trace(processedBuffer, traceOptions);

    // Clean up and optimize the SVG
    let optimizedSvg = svg
      .replace(/width="[^"]*"/, `width="100%"`)
      .replace(/height="[^"]*"/, `height="100%"`)
      .replace(/<svg/, '<svg preserveAspectRatio="xMidYMid meet"');

    // Apply color if specified
    if (svgColor && svgColor !== '#000000') {
      optimizedSvg = optimizedSvg.replace(/fill="[^"]*"/g, `fill="${svgColor}"`);
      optimizedSvg = optimizedSvg.replace(/stroke="[^"]*"/g, `stroke="${svgColor}"`);
      console.log('🎨 Applied color:', svgColor);
    }

    // Remove unnecessary whitespace and comments
    optimizedSvg = optimizedSvg
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .trim();

    optimizedSvg = optimizedSvg.replace(/^[^\<]*/, '');
    
    // Validate SVG
    if (!optimizedSvg.startsWith('<svg')) {
      throw new Error('Generated content is not a valid SVG');
    }

    // Clean up temporary file
    try {
      fs.unlinkSync(imageFile.filepath);
    } catch (cleanupError) {
      console.warn('Could not clean up temp file:', cleanupError.message);
    }

    console.log('✅ Vercel conversion complete!');
    console.log('📊 SVG size:', optimizedSvg.length, 'characters');

    res.status(200).json({ 
      success: true,
      svg: optimizedSvg,
      originalSize: imageFile.size,
      svgSize: optimizedSvg.length,
      metadata: {
        originalWidth: metadata.width,
        originalHeight: metadata.height,
        format: metadata.format
      }
    });

  } catch (error) {
    console.error('❌ Vercel conversion error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Internal server error' 
    });
  }
}
