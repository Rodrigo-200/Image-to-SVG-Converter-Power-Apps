# Copilot Instructions for Image to SVG Converter Power Apps

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a Vue.js web application that converts images to SVG format specifically optimized for Microsoft Power Apps. The application provides multiple input methods, customization options, and a modern, clean interface.

## Core Features & Requirements

### Image Input Methods
- **File Upload**: Drag & drop or click to upload image files (JPG, PNG, GIF, WEBP, BMP)
- **Clipboard Paste**: Paste images directly from clipboard using Ctrl+V
- **URL Input**: Enter image URLs to fetch and convert remote images
- **Camera Capture**: Option to capture images directly from device camera

### Conversion Features
- Convert images to SVG format optimized for Power Apps
- Remove borders/padding to fit small controls
- Adjust SVG color (single color conversion for icons)
- Preserve aspect ratio with optional stretching
- Optimize SVG code for minimal file size

### UI/UX Requirements
- **Modern Design**: Clean, minimal, professional appearance
- **Smooth Animations**: Subtle transitions and micro-interactions
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Dark/Light Theme**: Theme toggle with system preference detection
- **Icons**: Use Lucide Vue Next for consistent iconography
- **Color Scheme**: Professional palette suitable for business applications

### Customization Options
- **Preview Background**: Change background color to test SVG visibility
- **SVG Color**: Convert to single color (useful for icons)
- **Border Removal**: Automatically detect and remove whitespace/borders
- **Size Options**: Preset sizes for Power Apps controls (small, medium, large)
- **Quality Settings**: Balance between file size and detail preservation

## Technical Stack

### Framework & Build
- **Vue.js 3**: Composition API with `<script setup>` syntax
- **Vite**: Fast build tool and dev server
- **CSS**: Modern CSS with CSS Grid, Flexbox, and custom properties

### Dependencies
- **lucide-vue-next**: Icons and UI elements
- **fabric**: Canvas manipulation and image processing
- **file-saver**: Download converted SVG files

### File Structure
```
src/
├── components/
│   ├── ImageUpload.vue       # File upload component
│   ├── ClipboardPaste.vue    # Clipboard paste functionality
│   ├── UrlInput.vue          # URL input component
│   ├── PreviewArea.vue       # Image and SVG preview
│   ├── ControlsPanel.vue     # Conversion settings
│   ├── DownloadOptions.vue   # Export options
│   └── ThemeToggle.vue       # Dark/light theme toggle
├── composables/
│   ├── useImageConversion.js # Core conversion logic
│   ├── useClipboard.js       # Clipboard functionality
│   └── useTheme.js           # Theme management
├── utils/
│   ├── svgOptimizer.js       # SVG optimization utilities
│   ├── imageProcessor.js     # Image processing helpers
│   └── powerAppsHelpers.js   # Power Apps specific utilities
└── assets/
    └── styles/               # Global styles and themes
```

## Code Style Guidelines

### Vue Components
- Use Composition API with `<script setup>`
- Implement proper TypeScript types when possible
- Use reactive() for complex state, ref() for primitives
- Keep components focused and single-responsibility
- Use proper Vue 3 patterns (defineProps, defineEmits)

### CSS/Styling
- Use CSS custom properties for theming
- Implement proper responsive design (mobile-first)
- Use semantic class names (BEM methodology preferred)
- Add smooth transitions for all interactive elements
- Ensure proper contrast ratios for accessibility

### Image Processing
- Handle all common image formats gracefully
- Implement proper error handling for failed conversions
- Optimize for performance with large images
- Provide progress indicators for long operations
- Cache processed results when appropriate

## Power Apps Optimization
- Generate clean, minimal SVG code
- Remove unnecessary metadata and comments
- Optimize path data for smaller file sizes
- Ensure compatibility with Power Apps SVG requirements
- Test with various Power Apps control sizes

## User Experience Priorities
1. **Intuitive Interface**: Clear visual hierarchy and logical flow
2. **Fast Performance**: Quick conversions and responsive UI
3. **Visual Feedback**: Loading states, progress indicators, and success/error messages
4. **Accessibility**: Keyboard navigation, screen reader support, proper ARIA labels
5. **Mobile-Friendly**: Touch-friendly interface and responsive design

## Future Enhancement Areas
- Batch processing for multiple images
- SVG animation options
- Integration with cloud storage services
- Advanced vectorization algorithms
- Custom Power Apps templates
- Real-time collaboration features

## Development Best Practices
- Write comprehensive unit tests for conversion logic
- Implement proper error boundaries and fallbacks
- Use semantic HTML and proper ARIA attributes
- Optimize bundle size and loading performance
- Follow Vue.js style guide and best practices
- Document complex algorithms and business logic

## Design Tokens
- Use consistent spacing scale (4px, 8px, 16px, 24px, 32px, 48px)
- Implement proper color system with semantic naming
- Use appropriate typography scale with proper hierarchy
- Maintain consistent border radius and shadow patterns
- Ensure proper focus states for all interactive elements

Remember: Always prioritize user experience, maintain clean and readable code, and ensure the application remains performant even with large images or multiple conversions.
