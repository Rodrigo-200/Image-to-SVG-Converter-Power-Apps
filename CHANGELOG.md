# Changelog

All notable changes to the Image to SVG Converter for Power Apps project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2025-05-28

### 🚀 Major Features
- **BREAKING**: Increased file size limit from 10MB to 1GB
- Enhanced server configuration for large image processing
- Improved Vercel deployment configuration

### ✨ Added
- 1GB file size support in both local server and Vercel API
- Comprehensive file size testing interface (`tests/test-file-size-limit.html`)
- Enhanced error messages with current file size display
- Project structure organization with `docs/` and `tests/` directories

### 🔧 Changed
- Updated multer file size limit: 10MB → 1GB
- Updated formidable max file size: 10MB → 1GB
- Updated frontend validation: 10MB → 1GB
- Updated UI display: "Maximum file size: 1GB"
- Removed invalid Vercel `limits` configuration

### 📁 Project Organization
- Moved all test files to `tests/` directory
- Moved all documentation to `docs/` directory
- Added README files for both directories
- Improved project structure documentation

### 🐛 Fixed
- Vercel deployment error with invalid `limits` schema property
- Server errors for images larger than 10MB
- File organization and clutter cleanup

## [1.3.3] - 2025-05-28

### 🎯 Major Achievement
- **FIXED**: Border removal now actually crops downloaded SVG files
- Implemented pixel-perfect cropping using Sharp's extract() method

### ✨ Added
- Precise border detection with canvas pixel analysis
- Enhanced visual feedback with orange highlighting
- Comprehensive error handling and fallbacks
- File size validation with user-friendly messages
- Complete testing suite with 3/3 scenarios passing

### 🔧 Changed
- Replaced Sharp's basic trim() with precise extract() method
- Enhanced frontend border detection algorithm
- Improved progress tracking and user feedback
- Updated documentation and testing guides

### 📊 Quality Assurance
- Comprehensive border removal testing
- Pixel-perfect cropping validation
- Performance optimization
- Cross-browser compatibility testing

## [1.2.0] - Previous Versions

### Core Features Established
- Multiple input methods (upload, paste, URL, camera)
- Real-time preview with instant feedback
- Power Apps optimization
- Responsive design with dark/light themes
- Batch processing capabilities
- SVG color conversion and size presets

---

## Version Support

- **Current Stable**: 1.4.0 ✅
- **Development**: Active
- **Support**: Full support for latest version
- **Legacy**: 1.3.x supported for critical fixes only

## Upgrade Notes

### From 1.3.x to 1.4.0
- File size limit increased from 10MB to 1GB
- No breaking changes in API or functionality
- Enhanced file validation and error handling
- Improved project organization

### From 1.2.x to 1.3.x
- Border removal functionality completely rewritten
- Enhanced precision and reliability
- Backward compatible with all existing features
