# 🎨 Image to SVG Converter for Power Apps

A modern, responsive web application built with Vue.js that converts images to SVG format specifically optimized for Microsoft Power Apps. Features a clean interface with multiple input methods, advanced border detection, and real-time preview.

![Vue.js](https://img.shields.io/badge/Vue.js-3.5-4FC08D?style=flat&logo=vue.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=flat&logo=node.js&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## 🚀 Quick Start

### Local Development
**Prerequisites:** Node.js 18+ and npm

```bash
# Clone and setup
git clone <repository-url>
cd image-to-svg-converter-power-apps
npm install

# Start development (both frontend and backend)
npm run dev:full

# Or start individually
npm run server  # Backend on port 3001
npm run dev     # Frontend on port 5173
```

Visit `http://localhost:5173` to use the application!

### ☁️ Deploy to Vercel (Production)

**One-click deployment** with full mobile support:

```bash
# Automated deployment
./DEPLOY-NOW.bat     # Windows (recommended)
./deploy-vercel.sh   # Linux/macOS

# Manual deployment
npm install -g vercel
npm run build
vercel --prod
```

**After deployment:**
- ✅ Your app will be live at `https://[your-app].vercel.app`
- ✅ Test mobile connectivity at `[your-url]/vercel-mobile-test.html`
- ✅ Backend API available at `[your-url]/api/health` and `[your-url]/api/convert-to-svg`

## 📱 Mobile Access & Testing

**Mobile Optimized!** This application is fully responsive and optimized for mobile devices with automatic backend connectivity.

### 🔧 Smart Backend Detection
The app automatically detects your environment:
- **Local Development**: `http://localhost:3001`
- **Local Mobile**: `http://[YOUR-IP]:3001` 
- **Vercel Production**: `/api` prefix (same domain)

### Quick Mobile Setup (Local Development)
```bash
# Start with mobile access
./start-mobile.bat       # Windows
./deploy.sh mobile       # Linux/macOS
```

### Mobile Access Options
1. **Direct URL**: `http://YOUR_IP:5173` (IP shown in terminal)
2. **QR Code**: Open `phone-access.html` and scan with your phone
3. **Test Page**: Open `mobile-optimization-test.html` for verification

### Production Mobile Testing (Vercel)
After deploying to Vercel, test mobile connectivity:
1. Open `[your-vercel-url]/vercel-mobile-test.html` on your mobile device
2. Run the three connectivity tests:
   - ✅ Backend Health Check
   - ✅ Image Conversion Test  
   - ✅ Custom URL Test

### Mobile Features
- ✅ **Touch-optimized interface** with 44px minimum touch targets
- ✅ **Responsive design** that adapts to all screen sizes  
- ✅ **Camera integration** for direct photo capture
- ✅ **Gesture support** for smooth mobile navigation
- ✅ **Optimized performance** for mobile data and processing

**Requirements**: Phone must be on same WiFi network as development computer.

## ✨ Features

### 🖼️ Multiple Input Methods
- **File Upload**: Drag & drop or click to upload image files (JPG, PNG, GIF, WEBP, BMP)
- **Clipboard Paste**: Paste images directly from clipboard using Ctrl+V  
- **URL Input**: Enter image URLs to fetch and convert remote images

### 🔧 Advanced Conversion Features
- **Smart Border Detection**: Automatically detect and remove whitespace/borders with visual feedback
- **Color Conversion**: Convert images to single color (perfect for icons)
- **Power Apps Optimization**: SVG output optimized for Microsoft Power Apps controls
- **Real-time Preview**: Live preview with pixelated representation
- **Quality Control**: Balance between file size and detail preservation

### 🎨 User Experience
- **Modern UI**: Clean, minimal design with smooth animations
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **Dark/Light Theme**: Automatic theme detection with manual toggle
- **Visual Feedback**: Orange border highlighting for detected areas
- **Professional Icons**: Consistent iconography using Lucide Vue

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16.0 or higher
- **npm** or **yarn** package manager

### Installation & Setup

#### Quick Setup (Recommended)

Use the automated deployment scripts for easy setup:

**For Linux/macOS:**
```bash
git clone <repository-url>
cd image-to-svg-converter-power-apps
chmod +x deploy.sh
./deploy.sh setup     # Install dependencies and build
./deploy.sh dev       # Start development servers
```

**For Windows:**
```cmd
git clone <repository-url>
cd image-to-svg-converter-power-apps
deploy.bat setup      # Install dependencies and build
deploy.bat dev        # Start development servers
```

#### Manual Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd image-to-svg-converter-power-apps
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the application**
   ```bash
   # Start both frontend and backend servers
   npm run dev        # Frontend (Vite dev server)
   npm run server     # Backend (Node.js API server)
   ```

4. **Open in browser**
   ```
   Frontend: http://localhost:5173
   Backend:  http://localhost:3001
   ```

#### Deployment Script Commands

The deployment scripts provide several convenient commands:

- `setup` - Install dependencies and build for production
- `dev` - Start development servers with hot reload
- `build` - Build application for production
- `start` - Start production servers
- `deploy` - Full deployment (setup + start production)
- `test` - Run test suite (if configured)
- `lint` - Run code linting (if configured)

## 📱 Mobile Access

### Access from Phone/Tablet (Same WiFi Network)

**Quick Start for Mobile:**
```cmd
# Windows - Easy mobile setup
start-mobile.bat

# Or manually:
deploy.bat dev
```

The app is now configured to be accessible from any device on your local network:
- **Frontend**: `http://YOUR_IP:5173` (e.g., `http://192.168.1.100:5173`)
- **Backend**: `http://YOUR_IP:3001` (e.g., `http://192.168.1.100:3001`)

**To find your IP address:**
```powershell
# Windows PowerShell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notlike "*Loopback*"}
```

### Online Hosting (Access from Anywhere)
See the **[HOSTING-GUIDE.md](HOSTING-GUIDE.md)** for free hosting options including:
- **Netlify** - Drag & drop deployment
- **Vercel** - Full-stack hosting with APIs
- **GitHub Pages** - Static hosting
- **Railway/Render** - Backend + frontend hosting

## 🎯 Usage Guide

### Basic Workflow
1. **Choose Input Method**
   - **Upload**: Click or drag & drop image files
   - **Clipboard**: Copy an image and paste with Ctrl+V
   - **URL**: Enter a direct image URL

2. **Configure Settings**
   - **Remove Border**: Automatically detect and crop whitespace (with orange visual feedback)
   - **SVG Color**: Convert to single color for consistent theming
   - **Background Preview**: Test visibility against different backgrounds

3. **Preview & Convert**
   - View real-time preview with pixelated representation
   - Backend conversion produces high-quality SVG
   - Download optimized file ready for Power Apps

### Smart Border Detection
- **Visual Feedback**: Orange highlighting shows detected border areas
- **Automatic Cropping**: Removes unnecessary whitespace for cleaner icons
- **Debug Console**: Detailed logging for troubleshooting border detection

## 🛠️ Technology Stack

### Frontend
- **Vue.js 3** - Modern reactive framework with Composition API
- **Vite** - Fast build tool and development server
- **Lucide Vue** - Beautiful, consistent iconography
- **Modern CSS** - Custom properties, Grid, Flexbox

### Backend
- **Node.js** - Server-side image processing
- **Express.js** - REST API for conversion endpoints
- **Sharp** - High-performance image processing
- **Canvas** - Image manipulation and SVG generation

## 📁 Project Structure

```
├── src/
│   ├── components/           # Vue components
│   │   ├── ImageUpload.vue      # Drag & drop file upload
│   │   ├── ClipboardPaste.vue   # Clipboard functionality
│   │   ├── UrlInput.vue         # URL input component
│   │   ├── PreviewArea.vue      # Live preview with border detection
│   │   ├── ControlsPanel.vue    # Conversion settings
│   │   └── ThemeToggle.vue      # Dark/light theme switcher
│   ├── composables/          # Vue composables
│   │   ├── useImageConversion.js # Core conversion logic & border detection
│   │   └── useClipboard.js      # Clipboard handling
│   ├── utils/               # Utilities
│   │   └── svgOptimizer.js     # Power Apps SVG optimization
│   └── style.css           # Global styles and theme system
├── public/                  # Static assets
├── server.js               # Backend API server
├── package.json            # Dependencies and scripts
└── vite.config.js         # Vite configuration
```

## 🎯 Power Apps Optimization

### SVG Output Features
- **Clean Markup**: Minimal code without unnecessary metadata
- **Optimized Paths**: Compressed path data for smaller files
- **Proper Scaling**: ViewBox optimization for responsive scaling
- **Border Removal**: Smart whitespace detection and cropping
- **Color Consistency**: Single-color conversion for theming

### Recommended Usage in Power Apps
1. Upload images with clear borders/whitespace
2. Enable "Remove Border" for automatic cropping
3. Use single color conversion for consistent icons
4. Download and import directly into Power Apps

## 🚀 Development & Deployment

### Available Scripts
```bash
npm run dev     # Start frontend development server (port 5173)
npm run server  # Start backend API server (port 3001)
npm run build   # Build frontend for production
npm run preview # Preview production build
```

### Development Setup
1. Both frontend and backend servers must be running
2. Frontend handles UI and live preview
3. Backend processes high-quality SVG conversion
4. Cross-origin requests configured for local development

### Production Deployment
```bash
# Build frontend
npm run build

# Deploy dist/ folder to static hosting
# Deploy server.js to Node.js hosting platform
```

## 🔧 Configuration

### Environment Variables
```bash
# Backend server port (default: 3001)
PORT=3001

# Frontend development server port (default: 5173)
VITE_PORT=5173
```

### Border Detection Settings
- **Threshold**: 220 (brightness level for border detection)
- **Visual Feedback**: Orange highlighting with rgba(255, 152, 0, 0.6)
- **Debug Logging**: Comprehensive console output for troubleshooting

## 📝 Contributing

### Development Guidelines
1. Use Vue 3 Composition API with `<script setup>`
2. Follow modern CSS practices with custom properties
3. Maintain responsive design principles
4. Add comprehensive error handling
5. Include debug logging for troubleshooting

### Code Style
- **Components**: Single File Components with clear separation
- **Composables**: Reusable logic with proper reactivity
- **Styling**: CSS custom properties for theming
- **Error Handling**: Graceful fallbacks and user feedback

## 🐛 Troubleshooting

### Common Issues
- **Backend Connection**: Ensure both servers are running
- **Border Detection**: Check console for debug messages
- **File Upload**: Verify supported image formats (JPG, PNG, GIF, WEBP, BMP)
- **Clipboard Paste**: Requires HTTPS in production

### Debug Console Output
When "Remove Border" is enabled, look for:
```
🔍 Starting border detection... {width: 300, height: 300, threshold: 220}
🔍 Border detection complete: {top: 40, bottom: 40, left: 40, right: 40}
🔍 Borders detected: true
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Features Highlight

### ✅ Smart Border Detection
- Enhanced sensitivity algorithm
- Visual orange highlighting
- Real-time feedback

### ✅ Multiple Input Methods  
- File upload with drag & drop
- Clipboard paste support
- URL fetching capability

### ✅ Power Apps Ready
- Optimized SVG output
- Clean, minimal code
- Perfect for icons and graphics

### ✅ Modern UI/UX
- Responsive design
- Dark/light themes
- Smooth animations

---

**Perfect for creating clean, optimized SVG icons and graphics for Microsoft Power Apps! 🎨✨**
- Lucide for the beautiful icons
- Fabric.js for powerful canvas manipulation
- Vite for lightning-fast development experience

---

**Perfect for Power Apps developers who need high-quality SVG assets! 🚀**
