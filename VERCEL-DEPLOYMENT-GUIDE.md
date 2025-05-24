# Vercel Deployment Guide - Image to SVG Converter

## 🚀 Complete Vercel Deployment Setup

This guide provides step-by-step instructions for deploying the Image to SVG Converter Power Apps to Vercel with full mobile backend connectivity support.

### 📋 Prerequisites

1. **Node.js** (v16 or higher)
2. **Git** repository
3. **Vercel account** (free tier available)
4. **Vercel CLI** (will be installed automatically)

### 🏗️ Project Architecture

The project is configured with a **hybrid deployment** approach:

- **Frontend**: Static build deployed to Vercel Edge Network
- **Backend**: Serverless functions in `/api` directory
- **Mobile Support**: Automatic backend URL detection for mobile devices

### 📁 File Structure

```
project-root/
├── api/                        # Vercel serverless functions
│   ├── health.js              # Health check endpoint
│   └── convert-to-svg.js      # Image conversion endpoint
├── src/                       # Vue.js frontend
├── dist/                      # Built frontend (auto-generated)
├── vercel.json               # Vercel deployment configuration
├── deploy-vercel.bat         # Windows deployment script
├── deploy-vercel.sh          # Linux/Mac deployment script
└── vercel-mobile-test.html   # Mobile connectivity test page
```

## 🔧 Quick Deployment

### Option 1: Automated Script (Recommended)

**Windows:**
```powershell
.\deploy-vercel.bat
```

**Linux/Mac:**
```bash
chmod +x deploy-vercel.sh
./deploy-vercel.sh
```

### Option 2: Manual Deployment

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build Project**
   ```bash
   npm run build
   ```

3. **Install Vercel CLI** (if not already installed)
   ```bash
   npm install -g vercel
   ```

4. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

## 📱 Mobile Backend Connectivity

### How It Works

The application automatically detects the deployment environment:

- **Local Development**: `http://localhost:3001`
- **Local Mobile Access**: `http://[YOUR-IP]:3001`
- **Vercel Production**: `/api` prefix (same domain)

### Testing Mobile Connectivity

1. **Deploy to Vercel** using the steps above
2. **Open the deployment URL** on your mobile device
3. **Access the test page**: `[your-vercel-url]/vercel-mobile-test.html`
4. **Run all three tests**:
   - Backend Health Check
   - Image Conversion Test
   - Custom URL Test

### Mobile Test Page Features

- ✅ **Environment Detection**: Shows current URL, user agent, and backend configuration
- ✅ **Health Check**: Tests API connectivity
- ✅ **Image Upload**: Tests actual image conversion
- ✅ **Custom URL**: Tests different backend URLs
- ✅ **Mobile-Optimized**: Touch-friendly interface

## 🔧 Configuration Details

### Vercel Configuration (`vercel.json`)

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "routes": [
    {
      "src": "/api/health",
      "dest": "/api/health.js"
    },
    {
      "src": "/api/convert-to-svg",
      "dest": "/api/convert-to-svg.js"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/$1"
    }
  ],
  "functions": {
    "api/convert-to-svg.js": {
      "maxDuration": 30
    }
  }
}
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check and status |
| `/api/convert-to-svg` | POST | Image to SVG conversion |

### Environment Variables

No environment variables are required for basic deployment. The application uses:

- **Automatic URL Detection**: Frontend automatically detects the correct backend URL
- **CORS Configuration**: Configured to allow requests from any origin in production
- **File Upload Limits**: 10MB maximum file size

## 🐛 Troubleshooting

### Common Issues

1. **"Function not found" Error**
   - Ensure `/api` directory exists with proper `.js` files
   - Check `vercel.json` routing configuration
   - Verify build completed successfully

2. **Mobile Backend Connection Failed**
   - Test with the mobile test page: `/vercel-mobile-test.html`
   - Check browser developer tools for CORS errors
   - Verify the deployment URL is accessible

3. **Image Upload Fails**
   - Check file size (max 10MB)
   - Verify image format (JPG, PNG, GIF, WEBP, BMP)
   - Test with the mobile test page first

4. **Build Errors**
   ```bash
   npm run build
   ```
   - Ensure all dependencies are installed
   - Check for TypeScript/Vue errors
   - Verify Node.js version (v16+)

### Debug Mode

Enable debug logging by opening browser developer tools:

1. Open DevTools (F12)
2. Go to Console tab
3. Look for messages starting with:
   - `🔗 Backend URL configured:`
   - `✅ Backend connection established:`
   - `❌ Backend connection failed:`

## 📊 Performance Optimization

### Vercel Optimizations Applied

- ✅ **Edge Network**: Static assets served from global CDN
- ✅ **Serverless Functions**: Backend scales automatically
- ✅ **Image Processing**: Optimized Sharp.js configuration
- ✅ **Bundle Optimization**: Tree-shaking and minification
- ✅ **Caching**: Aggressive caching for static assets

### Mobile Optimizations

- ✅ **Touch-Friendly UI**: 44px minimum touch targets
- ✅ **Responsive Design**: Adapts to all screen sizes
- ✅ **Fast Loading**: Optimized bundle size and lazy loading
- ✅ **Offline Support**: Service worker for basic offline functionality

## 🔐 Security Features

- ✅ **CORS Protection**: Configured for production use
- ✅ **File Validation**: Server-side file type and size validation
- ✅ **Input Sanitization**: All user inputs are validated
- ✅ **Rate Limiting**: Vercel built-in rate limiting
- ✅ **HTTPS Only**: Automatic HTTPS in production

## 📈 Monitoring and Analytics

### Built-in Monitoring

- **Vercel Dashboard**: Real-time function execution stats
- **Error Logging**: Automatic error capture in serverless functions
- **Performance Metrics**: Response times and success rates

### Custom Logging

The application includes comprehensive logging:

```javascript
// Health check logs
console.log('✅ Backend connection established:', result)

// Conversion logs
console.log('🎯 Converting image to SVG...')
console.log('📄 Original file size:', imageFile.size)
console.log('✅ Vercel conversion complete!')
```

## 🚀 Next Steps

1. **Deploy to Vercel** using the automated scripts
2. **Test mobile connectivity** with the test page
3. **Customize branding** and styling as needed
4. **Set up custom domain** (optional)
5. **Configure analytics** (optional)

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Use the mobile test page to diagnose connectivity
3. Review Vercel function logs in the dashboard
4. Test locally first with `npm run dev` and `npm run server`

## 🔄 Updates and Maintenance

To update the deployment:

1. Make changes to your code
2. Run `npm run build` to test locally
3. Run `vercel --prod` to deploy updates
4. Test with the mobile test page

The application will automatically handle:
- ✅ Cache invalidation
- ✅ Zero-downtime deployments
- ✅ Automatic scaling
- ✅ SSL certificate renewal
