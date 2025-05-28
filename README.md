# Image to SVG Converter for Power Apps

A professional Vue.js web application that converts images to SVG format specifically optimized for Microsoft Power Apps. Features precise border removal, batch processing, real-time preview, and a responsive mobile-friendly interface.

![Vue.js](https://img.shields.io/badge/Vue.js-3.5-4FC08D?style=flat-square&logo=vue.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat-square&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=flat-square&logo=node.js&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)

**[Live Demo](https://image-to-svg-converter-power-apps-amanj0hib.vercel.app/)**

## ✨ Latest Updates (v1.3.3)

### 🎯 **Precise Border Removal** - FIXED!
- **Pixel-Perfect Cropping**: Downloaded SVGs are now actually cropped to remove detected borders
- **Visual Feedback**: Orange highlighting shows exactly what will be removed
- **Power Apps Ready**: No more manual editing required - SVGs fit perfectly in controls
- **Smart Detection**: Advanced canvas analysis detects borders with 220 brightness threshold

## Features

### Image Processing
- **Multiple Input Methods**: File upload, clipboard paste, URL input, camera capture
- **Batch Processing**: Upload and convert multiple images simultaneously
- **Format Support**: JPG, PNG, GIF, WEBP, BMP (max 1GB)
- **Real-time Preview**: Live preview with instant settings updates
- **🆕 Precise Border Removal**: Automatic whitespace removal with pixel-perfect cropping

### Power Apps Optimization
- **Clean SVG Output**: Optimized code for Power Apps controls
- **Size Presets**: Pre-configured sizes for small, medium, and large controls
- **Color Conversion**: Single-color conversion for icon usage
- **Minimal File Size**: Compressed SVG output for better app performance
- **🆕 Perfect Fit**: SVGs automatically sized for Power Apps controls

### User Experience
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Theme**: Theme toggle with system preference detection
- **Progress Indicators**: Visual feedback for conversion processes
- **Error Handling**: Comprehensive error messages and recovery options

## Quick Start

### Local Development

**Prerequisites:** Node.js 18+ and npm

```bash
# Clone repository
git clone <repository-url>
cd image-to-svg-converter-power-apps

# Install dependencies
npm install

# Start full development environment (frontend + backend)
npm run dev:full

# Or start services individually
npm run server  # Backend on port 3001
npm run dev     # Frontend on port 5173
```

Visit `http://localhost:5173` to access the application.

### Production Deployment

#### Deploy to Vercel

**Automated Deployment:**
```bash
# Windows
./DEPLOY-NOW.bat

# Linux/macOS
chmod +x deploy.sh
./deploy.sh
```

**Manual Deployment:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

## Usage Guide

### Basic Conversion
1. **Upload Images**: Drag and drop or click to select one or multiple image files
2. **Adjust Settings**: Configure border removal, color, and size options
3. **Preview**: Use the real-time preview to see changes instantly
4. **Convert**: Click "Convert to SVG" for high-quality processing
5. **Download**: Save your optimized SVG files

### Batch Processing
- Select multiple files during upload
- Navigate between images using the file queue controls
- Each image maintains its own settings and conversion state
- Remove individual images from the queue as needed

### Advanced Features
- **Live Preview**: See changes in real-time as you adjust settings
- **Border Detection**: Visual overlay shows detected borders before removal
- **Color Customization**: Convert to single-color SVGs for icon usage
- **Background Testing**: Change preview background to test SVG visibility

## Technical Architecture

### Frontend
- **Vue.js 3**: Composition API with modern reactive patterns
- **Vite**: Fast build tool and development server
- **Lucide Vue**: Consistent icon system
- **CSS Grid/Flexbox**: Modern responsive layouts

### Backend (Optional)
- **Node.js**: High-quality SVG conversion endpoint
- **Express**: Lightweight server framework
- **Sharp/Canvas**: Advanced image processing capabilities

### File Structure
```
src/
├── components/
│   ├── UnifiedImageInput.vue    # File upload and input handling
│   ├── PreviewArea.vue          # Image preview and file queue
│   ├── ControlsPanel.vue        # Conversion settings
│   └── ThemeToggle.vue          # Theme management
├── composables/
│   ├── useImageConversion.js    # Core conversion logic
│   └── useClipboard.js          # Clipboard functionality
└── utils/
    ├── svgOptimizer.js          # SVG optimization
    └── powerAppsHelpers.js      # Power Apps utilities
```

## Configuration

### Environment Variables
```bash
# Optional: Custom backend URL
VITE_BACKEND_URL=http://localhost:3001

# Optional: Analytics
VITE_ANALYTICS_ID=your-analytics-id
```

### Development Commands
```bash
npm run dev          # Frontend development server
npm run server       # Backend development server  
npm run dev:full     # Both frontend and backend
npm run build        # Production build
npm run preview      # Preview production build
npm run test         # Run test suite
```

## Browser Support

- **Chrome/Edge**: Full support with all features
- **Firefox**: Full support with all features
- **Safari**: Full support with all features
- **Mobile Browsers**: Optimized responsive experience

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes following the coding guidelines
4. Test thoroughly on multiple devices and browsers
5. Submit a pull request with a clear description

### Development Guidelines
- Use Vue 3 Composition API with `<script setup>` syntax
- Follow the existing component structure and naming conventions
- Ensure responsive design works on all screen sizes
- Use Lucide Vue icons (no emojis in code)
- Add appropriate error handling and user feedback
- Test batch processing functionality thoroughly

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Documentation**: This README and inline code comments
- **Community**: Discussions and feature requests welcome

---

**Version 1.3.1** - Enhanced Batch Processing

Latest features:
- Complete batch processing implementation
- File queue navigation with previous/next controls
- Smart X button behavior (remove file vs reset app)
- Download all files individually or as ZIP archive
- Mobile-responsive batch controls
- Enhanced error handling and progress tracking
- Better error handling and user feedback



### 📱 **Multiple Inputs**
- File upload with drag & drop
- Clipboard paste support
- URL fetching capability
- Camera capture on mobile

</td>
<td width="25%" align="center">

### 🚀 **Power Apps Ready**
- Optimized SVG output
- Clean, minimal code
- Perfect for icons
- Professional graphics

</td>
<td width="25%" align="center">

### 🎨 **Modern Experience**
- Responsive design
- Dark/light themes
- Smooth animations
- Professional icons

</td>
</tr>
</table>

---

<div align="center">

**🚀 Ready to create amazing SVG graphics for your Power Apps projects? Get started now! 🎨**

[![Get Started](https://img.shields.io/badge/Get_Started-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](#-quick-start)
[![Documentation](https://img.shields.io/badge/Documentation-646CFF?style=for-the-badge&logo=vite&logoColor=white)](#-features)
[![Contribute](https://img.shields.io/badge/Contribute-181717?style=for-the-badge&logo=github&logoColor=white)](#-contributing--development)

</div>
