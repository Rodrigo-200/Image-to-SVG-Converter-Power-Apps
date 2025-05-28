# Tests Directory

This directory contains all test files for the Image to SVG Converter project.

## Test Files

### JavaScript Tests
- `comprehensive-test.js` - Complete border removal functionality testing
- `test-backend-connection.js` - Server connectivity validation
- `test-border-removal.js` - Border detection and removal testing

### HTML Test Interfaces
- `test-file-size-limit.html` - Interactive file size limit testing (1GB)
- `test-border-image.html` - Border removal visual testing
- `test-image.html` - General image conversion testing
- `test-url-paste.html` - URL input and clipboard paste testing

### Test Results
- `test-output.svg` - Sample SVG output
- `test-result-*.svg` - Border removal test results for different scenarios

## Running Tests

### Manual Testing
Open any `.html` file in a browser to run interactive tests:
```bash
# Example
start tests/test-file-size-limit.html
```

### Automated Testing
Run JavaScript tests with Node.js:
```bash
node tests/comprehensive-test.js
```

### Server Testing
Ensure the server is running before testing:
```bash
npm run server
# Then run any test that requires server connectivity
```

## Test Scenarios Covered

1. **File Size Validation**: 1GB limit testing
2. **Border Removal**: Pixel-perfect cropping validation
3. **Format Support**: JPG, PNG, GIF, WEBP, BMP testing
4. **Server Connectivity**: Local and Vercel API testing
5. **User Interface**: Upload, paste, URL input testing
