# Image to SVG Converter for Power Apps

A modern, responsive web application built with Vue.js that converts images to SVG format specifically optimized for Microsoft Power Apps. Features a clean interface with multiple input methods, customization options, and real-time preview.

![Vue.js](https://img.shields.io/badge/Vue.js-3.5-4FC08D?style=flat&logo=vue.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.3-646CFF?style=flat&logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## ✨ Features

### 🖼️ Multiple Input Methods
- **File Upload**: Drag & drop or click to upload image files (JPG, PNG, GIF, WEBP, BMP)
- **Clipboard Paste**: Paste images directly from clipboard using Ctrl+V
- **URL Input**: Enter image URLs to fetch and convert remote images

### 🎨 Customization Options
- **Border Removal**: Automatically detect and remove whitespace/borders
- **Color Conversion**: Convert images to single color (perfect for icons)
- **Background Preview**: Change background color to test SVG visibility
- **Size Optimization**: Preset sizes optimized for Power Apps controls
- **Quality Settings**: Balance between file size and detail preservation

### 💡 User Experience
- **Modern Design**: Clean, minimal, professional appearance
- **Smooth Animations**: Subtle transitions and micro-interactions
- **Responsive Layout**: Works on desktop, tablet, and mobile devices
- **Dark/Light Theme**: Theme toggle with system preference detection
- **Real-time Preview**: Instant preview of original and converted SVG

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd image-to-svg-converter-power-apps
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 🛠️ Technology Stack

- **Framework**: Vue.js 3 with Composition API
- **Build Tool**: Vite
- **UI Icons**: Lucide Vue Next
- **Image Processing**: Fabric.js
- **File Handling**: FileSaver.js
- **Styling**: Modern CSS with CSS Custom Properties

## 📁 Project Structure

```
src/
├── components/           # Vue components
│   ├── ImageUpload.vue      # File upload with drag & drop
│   ├── ClipboardPaste.vue   # Clipboard paste functionality
│   ├── UrlInput.vue         # URL input component
│   ├── PreviewArea.vue      # Image and SVG preview
│   ├── ControlsPanel.vue    # Conversion settings
│   └── ThemeToggle.vue      # Dark/light theme toggle
├── composables/          # Vue composables
│   ├── useImageConversion.js # Core conversion logic
│   └── useClipboard.js      # Clipboard functionality
├── utils/               # Utility functions
│   └── svgOptimizer.js     # SVG optimization for Power Apps
├── assets/              # Static assets
└── style.css           # Global styles and theme system
```

## 🎯 Power Apps Optimization

The generated SVG files are specifically optimized for Microsoft Power Apps:

- **Clean Code**: Minimal SVG markup without unnecessary metadata
- **Optimized Paths**: Compressed path data for smaller file sizes
- **Proper Attributes**: Compatible with Power Apps SVG requirements
- **Border Removal**: Automatic whitespace detection and removal
- **Size Optimization**: Preset dimensions for Power Apps controls

## 🎨 Usage Guide

### 1. Choose Input Method
- **Upload**: Click or drag & drop image files
- **Clipboard**: Copy an image and paste with Ctrl+V
- **URL**: Enter a direct image URL

### 2. Customize Settings
- **Remove Border**: Automatically crop whitespace
- **SVG Color**: Convert to monochrome (great for icons)
- **Background**: Change preview background color
- **Quality**: Adjust conversion quality vs file size

### 3. Preview & Download
- Real-time preview of original vs converted
- Toggle between different background colors
- Download optimized SVG file

## 🌟 Key Features in Detail

### Smart Border Detection
Automatically detects and removes unnecessary borders and whitespace, perfect for creating clean icons that fit Power Apps controls precisely.

### Color Conversion
Convert multi-color images to single-color SVGs, ideal for creating consistent icon sets that match your Power Apps theme.

### Responsive Design
Works seamlessly across all devices with touch-friendly controls and adaptive layouts.

### Theme Support
Built-in light and dark themes that respect system preferences and provide a comfortable experience in any lighting condition.

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Style
- Vue.js 3 Composition API with `<script setup>`
- Modern CSS with custom properties
- ESLint and Prettier configuration
- Component-based architecture

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Vue.js team for the amazing framework
- Lucide for the beautiful icons
- Fabric.js for powerful canvas manipulation
- Vite for lightning-fast development experience

---

**Perfect for Power Apps developers who need high-quality SVG assets! 🚀**
