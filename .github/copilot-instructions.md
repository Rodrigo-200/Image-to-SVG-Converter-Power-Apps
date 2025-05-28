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
- **Responsive Layout**: Works on desktop, tablet, and mobile (768px breakpoint)
- **Dark/Light Theme**: Theme toggle with system preference detection
- **Icons**: Use Lucide Vue Next for consistent iconography - NO EMOJIS ALLOWED
- **Color Scheme**: Professional palette suitable for business applications

### Customization Options
- **Preview Background**: Change background color to test SVG visibility
- **SVG Color**: Convert to single color (useful for icons)
- **Border Removal**: Automatically detect and remove whitespace/borders
- **Size Options**: Preset sizes for Power Apps controls (small, medium, large)
- **Quality Settings**: Balance between file size and detail preservation

## Design System & Icon Guidelines

### Icon Standards
- **NEVER USE EMOJIS**: All icons must be from Lucide Vue Next library
- **Consistent Sizing**: Use predefined CSS classes for icon sizing (`.feature-icon-svg`, `.quality-icon-svg`)
- **Proper Stroke Width**: Standard stroke-width: 2 for all icons
- **Semantic Icons**: Choose icons that semantically represent the feature/action

### Icon Mapping Guidelines
- **Performance/Speed**: Use `Zap` icon
- **Design/Customization**: Use `Palette` icon  
- **Mobile/Responsive**: Use `Smartphone` icon
- **Enhancement/Quality**: Use `Sparkles` icon
- **Balance/Settings**: Use `Scale` icon
- **Visual/Preview**: Use `Eye` icon
- **Upload**: Use `Upload` icon
- **Download**: Use `Download` icon

### Responsive Design Rules
- **Desktop (>768px)**: Show `.desktop-title` with `display: block !important`
- **Mobile (≤768px)**: Hide `.desktop-title` with `display: none !important`
- **Mobile Action Bar**: Fixed bottom bar with collapsible sections
- **Touch Targets**: Minimum 44px for touch-friendly interaction

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
│   ├── ThemeToggle.vue       # Dark/light theme toggle
│   └── UnifiedImageInput.vue # Main input component
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
- Implement proper responsive design (mobile-first approach)
- Use semantic class names (BEM methodology preferred)
- Add smooth transitions for all interactive elements
- Ensure proper contrast ratios for accessibility
- **NEVER** use inline styles for emoji icons - always use Lucide Vue icons

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

## Recent Improvements & Standards

### Version Management & Changelog
Follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html) and [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) standards:

**Version Numbering:**
- **MAJOR** (x.0.0): Breaking changes that require user action
- **MINOR** (x.y.0): New features that are backward compatible
- **PATCH** (x.y.z): Bug fixes that are backward compatible

**Changelog Format:**
```markdown
## [1.5.0] - 2024-12-19
### Added
- New feature descriptions
### Changed
- Modifications to existing features
### Removed
- Removed features or files
### Fixed
- Bug fixes and corrections
```

**Always Update When Making Changes:**
1. Increment version in `package.json`
2. Add detailed entry to `CHANGELOG.md` 
3. Include all completed changes in the session
4. Specify migration notes if needed
5. Update README.md version badge if major/minor

### Completed Changes Tracking
**v1.5.0 (Current) - Production Optimization Release:**
- ✅ System dark mode theme consistency fix
- ✅ Mobile action bar responsive design (desktop hidden)
- ✅ Bundle size optimization with tree-shaking
- ✅ Icon import optimization across all components
- ✅ Dead code removal (4 unused files)
- ✅ Production build validation and testing
- ✅ CHANGELOG.md creation with semantic versioning
- ✅ README.md cleanup and modernization
- ✅ Copilot instructions enhancement for version tracking

**v1.4.0 - Project Cleanup:**
- ✅ Comprehensive optimization and cleanup
- ✅ Advanced icon import optimization
- ✅ Production build validation

**v1.3.3 - Border Removal Enhancement:**
- ✅ Pixel-perfect border removal with visual feedback
- ✅ Smart canvas analysis for border detection
- ✅ Orange highlighting overlay for detected borders

**v1.3.0 - Batch Processing:**
- ✅ Multiple image upload and processing
- ✅ File queue navigation controls
- ✅ ZIP download for batch operations
- ✅ Mobile-responsive batch controls

### Icon Implementation Pattern
When replacing emojis with Lucide icons:
```vue
<!-- OLD (NEVER DO THIS) -->
<span class="emoji-icon">✨</span>

<!-- NEW (CORRECT APPROACH) -->
<Sparkles class="feature-icon-svg" />
```

### Conditional Icon Rendering
For dynamic icon selection:
```vue
<!-- Template -->
<Zap class="quality-icon-svg" v-if="icon === 'zap'" />
<Scale class="quality-icon-svg" v-if="icon === 'scale'" />
<Sparkles class="quality-icon-svg" v-if="icon === 'sparkles'" />

<!-- Script -->
const qualityIcons = ['zap', 'scale', 'sparkles']
```

### CSS Classes for Icons
```css
.feature-icon-svg {
  width: 1rem;
  height: 1rem;
  stroke-width: 2;
}

.quality-icon-svg {
  width: 1.25rem;
  height: 1.25rem;
  stroke-width: 2;
}
```

### Media Query Standards
```css
/* Desktop styles (default) */
.desktop-element {
  display: block;
}

/* Mobile specific - use max-width: 768px */
@media (max-width: 768px) {
  .desktop-element {
    display: none !important;
  }
}

/* Desktop override - use min-width: 769px */
@media (min-width: 769px) {
  .desktop-element {
    display: block !important;
  }
}
```

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
- **ALWAYS** use Lucide Vue icons instead of emojis

## Design Tokens
- Use consistent spacing scale (4px, 8px, 16px, 24px, 32px, 48px)
- Implement proper color system with semantic naming
- Use appropriate typography scale with proper hierarchy
- Maintain consistent border radius and shadow patterns
- Ensure proper focus states for all interactive elements

## Quality Assurance Rules
1. **Icon Consistency**: All icons must be Lucide Vue components
2. **Responsive Testing**: Test all features at 768px breakpoint
3. **Accessibility**: Verify keyboard navigation and screen reader compatibility
4. **Performance**: Monitor conversion times and UI responsiveness
5. **Cross-browser**: Test on Chrome, Firefox, Safari, and Edge
6. **Mobile UX**: Verify touch targets are minimum 44px

Remember: Always prioritize user experience, maintain clean and readable code, and ensure the application remains performant even with large images or multiple conversions. The 768px breakpoint is critical for responsive design decisions.
