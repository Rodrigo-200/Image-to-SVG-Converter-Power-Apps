# Image to SVG Converter for Power Apps

A professional Vue.js web application that converts images to SVG format specifically optimized for Microsoft Power Apps. Features real-time preview, batch processing, responsive design, and production-ready optimization.

![Vue.js](https://img.shields.io/badge/Vue.js-3.5-4FC08D?style=flat-square&logo=vue.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat-square&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=flat-square&logo=node.js&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)
![Version](https://img.shields.io/badge/Version-1.5.0-blue?style=flat-square)

**[🚀 Live Demo](https://image-to-svg-converter-power-apps.vercel.app/)**

## ✨ Key Features

- **🎯 Power Apps Optimized**: Clean SVG output ready for Microsoft Power Apps controls
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile (768px breakpoint)
- **🔄 Batch Processing**: Upload and convert multiple images simultaneously
- **⚡ Real-time Preview**: Instant visual feedback as you adjust settings
- **🎨 Smart Border Removal**: Automatic whitespace detection and pixel-perfect cropping
- **🌓 Theme Support**: Dark/light mode with system preference detection
- **📦 Production Ready**: Optimized bundle size (234KB) with tree-shaking

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm

### Local Development
```bash
# Clone and install
git clone <repository-url>
cd image-to-svg-converter-power-apps
npm install

# Start development (frontend + backend)
npm run dev:full

# Or start individually
npm run server  # Backend (port 3001)
npm run dev     # Frontend (port 5173)
```

Visit `http://localhost:5173` to use the application.

### Production Build
```bash
npm run build    # Build for production
npm run preview  # Preview production build
```

## 📖 Usage

1. **Upload**: Drag & drop images or use file picker (supports JPG, PNG, GIF, WEBP, BMP)
2. **Configure**: Adjust border removal, colors, and quality settings
3. **Preview**: See real-time changes with visual border detection
4. **Convert**: Generate optimized SVG files
5. **Download**: Save individual files or batch download as ZIP

### Input Methods
- 📁 File upload with drag & drop
- 📋 Clipboard paste (Ctrl+V)
- 🔗 URL input for remote images
- 📷 Camera capture (mobile devices)

## 🏗️ Technical Stack

### Frontend
- **Vue.js 3**: Composition API with `<script setup>`
- **Vite**: Fast build tool and development server
- **Lucide Vue**: Consistent icon system (no emojis)
- **Modern CSS**: Grid, Flexbox, custom properties

### Backend (Optional)
- **Node.js + Express**: High-quality conversion endpoint
- **Sharp/Canvas**: Advanced image processing

### Build Optimization
- **Tree-shaking**: Optimized imports for minimal bundle size
- **Code splitting**: Efficient loading and caching
- **Production ready**: Tested builds with no errors

## 📁 Project Structure

```
src/
├── components/
│   ├── UnifiedImageInput.vue    # File upload and input handling
│   ├── PreviewArea.vue          # Image preview and file queue
│   ├── ControlsPanel.vue        # Conversion settings
│   ├── MobileActionBar.vue      # Mobile-only bottom controls
│   └── ThemeToggle.vue          # Theme management
├── composables/
│   └── useImageConversion.js    # Core conversion logic
└── utils/
    ├── svgOptimizer.js          # SVG optimization
    └── performance.js           # Performance monitoring
```

## 🌐 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

### Manual Deployment
Upload the `dist/` folder contents to any static hosting service.

## 📝 Configuration

### Environment Variables
```bash
# Optional: Custom backend URL
VITE_BACKEND_URL=http://localhost:3001
```

### Development Commands
| Command | Description |
|---------|-------------|
| `npm run dev` | Frontend development server |
| `npm run server` | Backend development server |
| `npm run dev:full` | Both frontend and backend |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

## 🔧 Browser Support

- ✅ Chrome/Edge: Full support
- ✅ Firefox: Full support  
- ✅ Safari: Full support
- ✅ Mobile browsers: Optimized experience

## 📋 Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed version history following [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Follow coding guidelines in `.github/copilot-instructions.md`
4. Test on multiple devices and screen sizes
5. Submit pull request with clear description

### Development Guidelines
- Use Vue 3 Composition API
- Follow 768px mobile breakpoint
- Use Lucide Vue icons only
- Ensure responsive design
- Add proper error handling
- Test batch processing thoroughly

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- [📖 Documentation](README.md)
- [🐛 Issues](https://github.com/yourusername/image-to-svg-converter-power-apps/issues)
- [🎯 Live Demo](https://image-to-svg-converter-power-apps.vercel.app/)
- [📋 Changelog](CHANGELOG.md)

---

<div align="center">

**Ready to create amazing SVG graphics for your Power Apps projects? 🎨**

[![Get Started](https://img.shields.io/badge/Get_Started-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](https://image-to-svg-converter-power-apps.vercel.app/)

</div>
