# 🎨 Image to SVG Converter for Power Apps

> **Professional SVG conversion tool optimized for Microsoft Power Apps** 
> 
> Transform images into high-quality SVG graphics with advanced border detection, real-time preview, and mobile-optimized interface.

<div align="center">

![Vue.js](https://img.shields.io/badge/Vue.js-3.5-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

**[🚀 Live Demo](https://image-to-svg-converter-power-apps-amanj0hib.vercel.app/)** • **[📚 Documentation](#-features)** • **[📱 Mobile Ready](#-mobile-access--testing)**

</div>

---

## 🚀 Quick Start

### 💻 Local Development

**Prerequisites:** Node.js 18+ and npm

```bash
# 📦 Clone and setup
git clone <repository-url>
cd image-to-svg-converter-power-apps
npm install

# 🎯 Start development (both frontend and backend)
npm run dev:full

# 🔧 Or start individually
npm run server  # Backend on port 3001
npm run dev     # Frontend on port 5173
```

**🌐 Visit:** `http://localhost:5173`

### ☁️ Deploy to Vercel (Production)

<details>
<summary><strong>✅ ONE-CLICK DEPLOYMENT</strong> - Click to expand</summary>

**🎯 Automated deployment** with full mobile support:

```bash
# 🪟 Windows (recommended)
./DEPLOY-NOW.bat

# 🐧 Linux/macOS
./deploy-vercel.sh

# 🛠️ Manual deployment
npm install -g vercel
npm run build
vercel --prod
```

**🔄 GitHub Auto-Deploy** (Recommended):
1. Push changes to your GitHub repository
2. Vercel automatically deploys from connected repo
3. No authentication issues - public access enabled!

**✅ After deployment:**
- Live at `https://[your-app].vercel.app`
- Test mobile: `[your-url]/VERCEL-SUCCESS-TEST.html`
- Backend API: `[your-url]/api/health` and `[your-url]/api/convert-to-svg`

</details>

---

## 📱 Mobile Access & Testing

<div align="center">
<strong>📱 FULLY MOBILE OPTIMIZED</strong> with automatic backend connectivity
</div>

### 🔧 Smart Backend Detection

The app intelligently detects your environment:

| Environment | Backend URL |
|------------|-------------|
| 🏠 **Local Development** | `http://localhost:3001` |
| 📱 **Local Mobile** | `http://[YOUR-IP]:3001` |
| ☁️ **Vercel Production** | `/api` (same domain) |

### 🚀 Quick Mobile Setup

<details>
<summary><strong>📱 Local Development Mobile Access</strong></summary>

```bash
# 🪟 Windows
./start-mobile.bat

# 🐧 Linux/macOS
./deploy.sh mobile
```

**📋 Access Options:**
1. **Direct URL**: `http://YOUR_IP:5173` (IP shown in terminal)
2. **QR Code**: Open `phone-access.html` and scan
3. **Test Page**: Use `mobile-optimization-test.html` for verification

</details>

<details>
<summary><strong>☁️ Production Mobile Testing</strong></summary>

After Vercel deployment:
1. Open `[your-vercel-url]/vercel-mobile-test.html` on mobile
2. Run connectivity tests:
   - ✅ Backend Health Check
   - ✅ Image Conversion Test  
   - ✅ Custom URL Test

</details>

### 📱 Mobile Features

- ✅ **Touch-optimized** interface (44px minimum touch targets)
- ✅ **Responsive design** adapts to all screen sizes  
- ✅ **Camera integration** for direct photo capture
- ✅ **Gesture support** for smooth navigation
- ✅ **Optimized performance** for mobile data/processing

---

## ✨ Features

### 🖼️ Multiple Input Methods

| Method | Description | Supported Formats |
|--------|-------------|------------------|
| 📁 **File Upload** | Drag & drop or click to upload | JPG, PNG, GIF, WEBP, BMP |
| 📋 **Clipboard Paste** | Direct paste with `Ctrl+V` | Any image format |
| 🌐 **URL Input** | Fetch images from web URLs | All web-accessible images |
| 📷 **Camera Capture** | Direct photo capture on mobile | Real-time camera access |

### 🔧 Advanced Conversion Features

<table>
<tr>
<td width="50%">

**🎯 Smart Processing**
- ✅ **Border Detection** - Auto-detect and remove whitespace
- ✅ **Color Conversion** - Single color output for icons  
- ✅ **Quality Control** - Balance size vs detail
- ✅ **Real-time Preview** - Live conversion feedback

</td>
<td width="50%">

**🚀 Power Apps Optimization**
- ✅ **Minimal SVG Code** - Optimized for Power Apps
- ✅ **Control Sizing** - Preset sizes for controls
- ✅ **Performance Optimized** - Fast loading graphics
- ✅ **Compatibility Tested** - Works across Power Apps

</td>
</tr>
</table>

### 🎨 User Experience

<div align="center">

| Feature | Desktop | Mobile | Description |
|---------|---------|--------|-------------|
| 🎨 **Modern UI** | ✅ | ✅ | Clean, minimal design with smooth animations |
| 📱 **Responsive** | ✅ | ✅ | Adapts perfectly to all screen sizes |
| 🌗 **Dark/Light Theme** | ✅ | ✅ | Auto-detection with manual toggle |
| 👆 **Touch Optimized** | ➖ | ✅ | 44px minimum touch targets |
| 🔍 **Visual Feedback** | ✅ | ✅ | Orange border highlighting for detected areas |
| 🎯 **Professional Icons** | ✅ | ✅ | Consistent Lucide Vue iconography |

</div>

---

## 🛠️ Technical Stack

<div align="center">

### Frontend
![Vue.js](https://img.shields.io/badge/Vue.js_3-4FC08D?style=flat&logo=vue.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

### Backend  
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![Canvas_API](https://img.shields.io/badge/Canvas_API-FF6B6B?style=flat)

### Dependencies
![Lucide](https://img.shields.io/badge/Lucide_Icons-000000?style=flat)
![Fabric.js](https://img.shields.io/badge/Fabric.js-FF6B35?style=flat)
![File_Saver](https://img.shields.io/badge/File_Saver-4285F4?style=flat)

</div>

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** 18.0 or higher
- **npm** 9.0 or higher

### 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend development server (port 5173) |
| `npm run server` | Start backend API server (port 3001) |
| `npm run dev:full` | Start both frontend and backend |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

### 🛠️ Manual Installation

```bash
# 1️⃣ Clone the repository
git clone <repository-url>
cd image-to-svg-converter-power-apps

# 2️⃣ Install dependencies
npm install

# 3️⃣ Start development servers
npm run dev:full       # Both frontend and backend
# OR start individually:
npm run dev            # Frontend (Vite dev server)
npm run server         # Backend (Node.js API server)

# 4️⃣ Open in browser
# Frontend: http://localhost:5173
# Backend:  http://localhost:3001
```

### 🎯 Automated Setup Scripts

<details>
<summary><strong>🖥️ Platform-Specific Scripts</strong></summary>

**🪟 Windows:**
```cmd
git clone <repository-url>
cd image-to-svg-converter-power-apps
deploy.bat setup      # Install dependencies and build
deploy.bat dev        # Start development servers
```

**🐧 Linux/macOS:**
```bash
git clone <repository-url>
cd image-to-svg-converter-power-apps
chmod +x deploy.sh
./deploy.sh setup     # Install dependencies and build
./deploy.sh dev       # Start development servers
```

**Deployment Script Commands:**
- `setup` - Install dependencies and build for production
- `dev` - Start development servers with hot reload
- `build` - Build application for production
- `start` - Start production servers
- `deploy` - Full deployment (setup + start production)

</details>

---

## 🎯 Usage Guide

### 📋 Basic Workflow

1. **🖼️ Choose Input Method**
   - **📁 Upload**: Click or drag & drop image files
   - **📋 Clipboard**: Copy an image and paste with `Ctrl+V`
   - **🌐 URL**: Enter a direct image URL
   - **📷 Camera**: Capture photos directly on mobile

2. **⚙️ Configure Settings**
   - **🎯 Remove Border**: Automatically detect and crop whitespace (with orange visual feedback)
   - **🎨 SVG Color**: Convert to single color for consistent theming
   - **🔍 Background Preview**: Test visibility against different backgrounds

3. **👀 Preview & Convert**
   - View real-time preview with pixelated representation
   - Backend conversion produces high-quality SVG
   - Download optimized file ready for Power Apps

### 🔍 Smart Border Detection

<div align="center">

| Feature | Visual Indicator | Purpose |
|---------|------------------|---------|
| **Border Detection** | 🟠 Orange highlighting | Shows detected border areas |
| **Auto Cropping** | 📏 Real-time preview | Removes unnecessary whitespace |
| **Debug Console** | 📊 Detailed logging | Troubleshooting and optimization |

</div>

**Console Output Example:**
```
🔍 Starting border detection... {width: 300, height: 300, threshold: 220}
🔍 Border detection complete: {top: 40, bottom: 40, left: 40, right: 40}
🔍 Borders detected: true
```

---

## 🛠️ Technical Architecture

### 📊 Project Structure

```
image-to-svg-converter-power-apps/
├── 📁 src/
│   ├── 🧩 components/           # Vue components
│   │   ├── ImageUpload.vue          # Drag & drop file upload
│   │   ├── ClipboardPaste.vue       # Clipboard functionality
│   │   ├── UrlInput.vue             # URL input component
│   │   ├── PreviewArea.vue          # Live preview with border detection
│   │   ├── ControlsPanel.vue        # Conversion settings
│   │   └── ThemeToggle.vue          # Dark/light theme switcher
│   ├── 🔧 composables/          # Vue composables
│   │   ├── useImageConversion.js    # Core conversion logic & border detection
│   │   └── useClipboard.js          # Clipboard handling
│   ├── 🛠️ utils/               # Utilities
│   │   └── svgOptimizer.js          # Power Apps SVG optimization
│   └── 🎨 style.css             # Global styles and theme system
├── 📁 public/                  # Static assets
├── 🖥️ server.js               # Backend API server
├── 📦 package.json            # Dependencies and scripts
└── ⚙️ vite.config.js         # Vite configuration
```

### 🔧 Technology Components

<table>
<tr>
<td width="50%">

**🎨 Frontend Stack**
- **Vue.js 3** - Composition API with `<script setup>`
- **Vite** - Fast build tool and development server
- **Lucide Vue** - Professional icon library
- **Modern CSS** - Custom properties, Grid, Flexbox

</td>
<td width="50%">

**🖥️ Backend Stack**  
- **Node.js** - Server-side image processing
- **Express.js** - REST API for conversion endpoints
- **Sharp** - High-performance image processing
- **Canvas** - Image manipulation and SVG generation

</td>
</tr>
</table>

---

## 🎯 Power Apps Optimization

### 📋 SVG Output Features

<table>
<tr>
<td width="50%">

**⚡ Performance Features**
- ✅ **Clean Markup** - Minimal code without metadata
- ✅ **Optimized Paths** - Compressed path data
- ✅ **Proper Scaling** - ViewBox optimization
- ✅ **Fast Loading** - Optimized for Power Apps performance

</td>
<td width="50%">

**🎨 Visual Features**
- ✅ **Border Removal** - Smart whitespace detection  
- ✅ **Color Consistency** - Single-color conversion
- ✅ **Responsive Scaling** - Adapts to control sizes
- ✅ **Clean Output** - Professional appearance

</td>
</tr>
</table>

### 🚀 Recommended Power Apps Workflow

1. **📸 Upload** images with clear borders/whitespace
2. **🎯 Enable** "Remove Border" for automatic cropping  
3. **🎨 Use** single color conversion for consistent icons
4. **📥 Download** and import directly into Power Apps

---

## ⚙️ Configuration & Development

### 🌍 Environment Variables

```bash
# Backend server port (default: 3001)
PORT=3001

# Frontend development server port (default: 5173)  
VITE_PORT=5173
```

### 🔧 Border Detection Settings

| Setting | Default Value | Description |
|---------|---------------|-------------|
| **Threshold** | `220` | Brightness level for border detection |
| **Visual Feedback** | `rgba(255, 152, 0, 0.6)` | Orange highlighting color |
| **Debug Logging** | `enabled` | Comprehensive console output |

### 🛠️ Development Guidelines

<details>
<summary><strong>📋 Code Standards & Best Practices</strong></summary>

**🎯 Component Development:**
- Use Vue 3 Composition API with `<script setup>`
- Follow modern CSS practices with custom properties
- Maintain responsive design principles (768px breakpoint)
- Add comprehensive error handling

**🎨 Styling Standards:**
- **Components**: Single File Components with clear separation
- **Composables**: Reusable logic with proper reactivity  
- **CSS**: Custom properties for theming consistency
- **Icons**: Lucide Vue only (no emojis)

**📱 Responsive Rules:**
- Desktop (>768px): Full feature set with `.desktop-title` visible
- Mobile (≤768px): Touch-optimized with 44px minimum targets
- Progressive enhancement for mobile features

</details>

---

## 🐛 Troubleshooting

### ❗ Common Issues

<table>
<tr>
<td width="30%"><strong>Issue</strong></td>
<td width="70%"><strong>Solution</strong></td>
</tr>
<tr>
<td>🔗 Backend Connection</td>
<td>Ensure both servers are running: <code>npm run dev:full</code></td>
</tr>
<tr>
<td>🎯 Border Detection</td>
<td>Check console for debug messages starting with 🔍</td>
</tr>
<tr>
<td>📁 File Upload</td>
<td>Verify supported formats: JPG, PNG, GIF, WEBP, BMP</td>
</tr>
<tr>
<td>📋 Clipboard Paste</td>
<td>Requires HTTPS in production environments</td>
</tr>
</table>

### 📊 Debug Console Examples

**✅ Successful Border Detection:**
```
🔍 Starting border detection... {width: 300, height: 300, threshold: 220}
🔍 Border detection complete: {top: 40, bottom: 40, left: 40, right: 40}  
🔍 Borders detected: true
✅ SVG conversion completed successfully
```

**❌ No Borders Found:**
```
🔍 Starting border detection... {width: 200, height: 200, threshold: 220}
🔍 Border detection complete: {top: 0, bottom: 0, left: 0, right: 0}
🔍 Borders detected: false
ℹ️ No borders to remove - using original dimensions
```

---

## 🤝 Contributing & Development

### 🚀 Getting Started with Development

1. **Fork** the repository on GitHub
2. **Clone** your fork locally
3. **Install** dependencies: `npm install`
4. **Create** a feature branch: `git checkout -b feature/amazing-feature`
5. **Start** development servers: `npm run dev:full`
6. **Make** your changes with comprehensive testing
7. **Commit** with clear messages: `git commit -m 'Add amazing feature'`
8. **Push** to your branch: `git push origin feature/amazing-feature`
9. **Create** a Pull Request

### 📋 Development Checklist

- [ ] ✅ **Code Quality**: Follow Vue 3 and modern CSS best practices
- [ ] 📱 **Responsive**: Test at 768px breakpoint thoroughly  
- [ ] 🎨 **Icons**: Use only Lucide Vue components (no emojis)
- [ ] ♿ **Accessibility**: Verify keyboard navigation and screen readers
- [ ] 🧪 **Testing**: Ensure all conversion features work correctly
- [ ] 📱 **Mobile**: Test touch interactions and camera functionality

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🌟 Why Choose This Tool?

<div align="center">

### 🎯 **Perfect for Power Apps Development**

**✨ Smart Border Detection** • **🎨 Professional UI** • **📱 Mobile Optimized** • **⚡ High Performance**

</div>

<table>
<tr>
<td width="25%" align="center">

### 🔍 **Smart Processing**
- Enhanced sensitivity algorithm
- Visual orange highlighting  
- Real-time feedback
- Automatic optimization

</td>
<td width="25%" align="center">

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
