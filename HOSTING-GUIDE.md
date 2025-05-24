# 🌐 Free Hosting Guide for Image to SVG Converter

This guide covers how to host your Image to SVG Converter for free and access it from any device, including your phone.

## 📱 Quick Access on Phone (Development)

### Option 1: Local Network Access
When running locally, you can access from your phone on the same WiFi network:

1. **Start the development server:**
   ```bash
   ./deploy.sh dev     # Linux/macOS
   deploy.bat dev      # Windows
   ```

2. **Find your computer's IP address:**
   ```bash
   # Windows (PowerShell)
   Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notlike "*Loopback*"}
   
   # Linux/macOS
   ip addr show | grep inet
   ```

3. **Access from phone:**
   - Frontend: `http://YOUR_IP:5173`
   - Example: `http://192.168.1.100:5173`

### Option 2: Expose to Internet (Temporary)
Use tools like ngrok for temporary public access:

```bash
# Install ngrok
npm install -g ngrok

# Expose your local server
ngrok http 5173
```

Copy the provided URL (e.g., `https://abc123.ngrok.io`) to access from anywhere.

---

## 🆓 Free Hosting Options

### 1. **Netlify** (Recommended - Easy Static Hosting)

**Best for:** Frontend-only deployment with serverless functions

#### Setup Steps:
1. **Build your project:**
   ```bash
   npm run build
   ```

2. **Create account at [netlify.com](https://netlify.com)**

3. **Deploy via Drag & Drop:**
   - Drag the `dist` folder to Netlify dashboard
   - Get instant URL like `https://amazing-name-123.netlify.app`

4. **For continuous deployment:**
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`

#### Custom Domain (Free):
- Add custom domain in Netlify settings
- Get free HTTPS certificate automatically

---

### 2. **Vercel** (Recommended - Full-Stack)

**Best for:** Full-stack deployment with API routes

#### Setup Steps:
1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Follow prompts:**
   - Link to GitHub (optional)
   - Configure build settings
   - Get instant URL like `https://your-app.vercel.app`

#### Configuration:
Create `vercel.json` in project root:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/$1"
    }
  ]
}
```

---

### 3. **GitHub Pages** (Frontend Only)

**Best for:** Simple static hosting

#### Setup Steps:
1. **Push to GitHub repository**

2. **Enable GitHub Pages:**
   - Go to repository Settings
   - Scroll to Pages section
   - Select source: GitHub Actions

3. **Create workflow file** `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

**Access:** `https://yourusername.github.io/repository-name`

---

### 4. **Railway** (Full-Stack with Database)

**Best for:** When you need backend processing

#### Setup Steps:
1. **Create account at [railway.app](https://railway.app)**

2. **Connect GitHub repository**

3. **Configure environment:**
   - Set start command: `npm start`
   - Add environment variables if needed

4. **Deploy automatically on git push**

**Access:** Get custom subdomain like `https://yourapp.railway.app`

---

### 5. **Render** (Full-Stack Alternative)

**Best for:** Simple full-stack deployment

#### Setup Steps:
1. **Create account at [render.com](https://render.com)**

2. **Create Web Service:**
   - Connect GitHub repository
   - Set build command: `npm install && npm run build`
   - Set start command: `npm run server`

3. **Deploy automatically**

**Access:** Get URL like `https://yourapp.onrender.com`

---

## 🔧 Deployment Configuration

### For Static Hosting (Netlify/GitHub Pages)
You'll need to modify the app to work without a backend server. Update `src/composables/useImageConversion.js` to use client-side processing only.

### For Full-Stack Hosting (Vercel/Railway/Render)
The current setup works perfectly as-is with both frontend and backend.

---

## 📱 Mobile Optimization

### PWA Features (Optional)
Make your app work like a native mobile app:

1. **Add to `public/manifest.json`:**
```json
{
  "name": "Image to SVG Converter",
  "short_name": "SVG Converter",
  "description": "Convert images to SVG for Power Apps",
  "theme_color": "#646cff",
  "background_color": "#ffffff",
  "display": "standalone",
  "start_url": "/",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

2. **Add service worker for offline support**

3. **Update `index.html`:**
```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#646cff">
```

---

## 🎯 Recommended Workflow

### For Personal Use:
1. **Netlify** - Drag & drop the `dist` folder
2. Access from phone via the provided URL
3. Bookmark on phone home screen

### For Professional/Production:
1. **Vercel** - Full-stack deployment with API
2. Custom domain configuration
3. Continuous deployment from GitHub

### For Learning/Testing:
1. **GitHub Pages** - Free and simple
2. Great for showcasing your work
3. Easy version control integration

---

## 🔗 Quick Links

- **Netlify:** https://netlify.com
- **Vercel:** https://vercel.com  
- **GitHub Pages:** https://pages.github.com
- **Railway:** https://railway.app
- **Render:** https://render.com

## 🚀 Next Steps

1. Choose your preferred hosting platform
2. Follow the setup steps above
3. Share your app URL with others
4. Access from any device, anywhere!

---

**💡 Pro Tip:** For the best mobile experience, use Vercel or Netlify as they provide excellent performance and global CDN for fast loading on mobile devices.
