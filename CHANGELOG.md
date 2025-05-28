# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.5.0] - 2024-12-19
**Status**: ✅ COMPLETED - All features implemented and tested

### Added
- Production-ready build optimization with tree-shaking
- Consistent system dark mode theme matching manual dark mode
- Mobile-only responsive design for action bar (hidden on desktop screens >768px)
- Comprehensive optimization documentation in OPTIMIZATION_SUMMARY.md
- Proper changelog following semantic versioning standards

### Changed
- **BREAKING**: System dark mode now uses same color scheme as manual dark mode (slate-based instead of blue-based)
- Optimized Lucide icon imports for better tree-shaking and reduced bundle size
- Mobile action bar now properly hidden on desktop devices (min-width: 769px)
- Bundle size reduced from initial size to 234.28 kB through import optimization

### Removed
- Unused component files: `ClipboardPaste.vue`, `ImageUpload.vue`, `UrlInput.vue`
- Unused composable: `useClipboard.js`
- Redundant icon imports across all components
- Dead code and unused dependencies

### Fixed
- System theme detection now correctly applies preferred dark mode colors
- Mobile action bar appearing on desktop screens (responsive design fix)
- Icon import optimization preventing unused icons from being bundled
- Build process optimization for production deployment

### Technical
- Final bundle size: 234.28 kB (gzipped: 78.22 kB)
- CSS: 62.91 kB (gzipped: 10.28 kB) 
- All builds successful with no errors or warnings
- Development server performance improvements

## [1.4.0] - 2024-12-18

### Added
- Comprehensive project optimization and cleanup
- Advanced icon import optimization for tree-shaking
- Production build validation and testing
- Performance monitoring and bundle size tracking

### Changed
- Streamlined project structure to essential components only
- Improved development workflow with optimized imports
- Enhanced build system configuration

### Removed
- Legacy unused files and components
- Redundant development dependencies

## [1.3.3] - 2024-12-17

### Added
- Pixel-perfect border removal with visual feedback
- Smart canvas analysis for border detection (220 brightness threshold)
- Orange highlighting overlay showing detected borders
- Advanced cropping functionality for downloaded SVGs

### Fixed
- Border removal now actually crops the downloaded SVG files
- Power Apps control fitting - no more manual editing required
- Visual feedback showing exactly what will be removed

## [1.3.0] - 2024-12-16

### Added
- Batch processing for multiple images
- File queue navigation with previous/next controls
- Individual file removal vs complete app reset functionality
- ZIP download for multiple converted files
- Mobile-responsive batch controls

### Changed
- Enhanced error handling and progress tracking
- Improved user feedback during conversion processes
- Better mobile experience for batch operations

## [1.2.0] - 2024-12-15

### Added
- Real-time live preview functionality
- Instant settings updates without re-conversion
- Advanced color customization options
- Background testing capabilities

### Changed
- Improved conversion performance
- Enhanced user interface responsiveness
- Better error handling for failed conversions

## [1.1.0] - 2024-12-14

### Added
- Multiple input methods: file upload, clipboard paste, URL input, camera capture
- Responsive design supporting desktop, tablet, and mobile (768px breakpoint)
- Dark/light theme toggle with system preference detection
- Power Apps optimization features

### Changed
- Modernized UI with professional color scheme
- Improved accessibility with proper ARIA labels
- Enhanced mobile touch targets (minimum 44px)

## [1.0.0] - 2024-12-13

### Added
- Initial release of Image to SVG Converter for Power Apps
- Vue.js 3 application with Composition API
- Basic image to SVG conversion functionality
- File upload support for multiple formats (JPG, PNG, GIF, WEBP, BMP)
- Clean SVG output optimized for Power Apps
- Express.js backend for high-quality conversion
- Vite build system for fast development
- MIT license for open source usage

### Technical Stack
- Vue.js 3 with Composition API
- Vite for build tooling
- Express.js backend
- Lucide Vue Next for consistent iconography
- Modern CSS with custom properties
- Sharp/Canvas for image processing

---

## Version History Summary

- **v1.5.0**: Production optimization, dark mode fixes, mobile responsiveness
- **v1.4.0**: Project cleanup and build optimization
- **v1.3.3**: Pixel-perfect border removal
- **v1.3.0**: Batch processing implementation
- **v1.2.0**: Real-time preview and advanced features
- **v1.1.0**: Multi-input methods and responsive design
- **v1.0.0**: Initial release with core functionality

## Migration Guide

### From v1.4.x to v1.5.0
- No breaking changes for end users
- System dark mode appearance may look different (now matches manual dark mode)
- Mobile action bar no longer appears on desktop screens
- Bundle size optimizations may improve loading performance

### From v1.3.x to v1.4.0
- No breaking changes
- Improved build performance and reduced bundle size
- Development workflow enhancements

### From v1.2.x to v1.3.0
- Enhanced batch processing features
- New file queue management
- Improved mobile experience

## Contributing

When contributing to this project, please:

1. Follow semantic versioning for version numbers
2. Update this changelog with your changes
3. Test all features on both desktop and mobile
4. Ensure responsive design works at 768px breakpoint
5. Use Lucide Vue icons only (no emojis)
6. Verify build optimization doesn't regress

## Links

- [Repository](https://github.com/yourusername/image-to-svg-converter-power-apps)
- [Live Demo](https://image-to-svg-converter-power-apps.vercel.app/)
- [Issues](https://github.com/yourusername/image-to-svg-converter-power-apps/issues)
- [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
- [Semantic Versioning](https://semver.org/)
