# 📱 Quick Mobile Access Guide

## 🚀 Start Using on Your Phone in 3 Steps

### Step 1: Start the App
```cmd
# Run this in your project folder
start-mobile.bat
```

### Step 2: Get Your Access URL
The script will show your IP address, for example:
```
📍 Your IP Address: 192.168.1.100
📱 Access from your phone: http://192.168.1.100:5173
```

### Step 3: Open on Phone
1. Make sure your phone is on the same WiFi network
2. Open your phone's browser (Chrome, Safari, etc.)
3. Type the URL shown (e.g., `http://192.168.1.100:5173`)
4. Bookmark it for easy access!

---

## 🔥 Want It Online? (Free Hosting)

### Option 1: Netlify (Easiest)
1. Run: `npm run build`
2. Go to [netlify.com](https://netlify.com)
3. Drag the `dist` folder to their website
4. Get instant public URL!

### Option 2: Vercel (Full-Stack)
1. Install: `npm install -g vercel`
2. Run: `vercel`
3. Follow prompts
4. Get instant public URL with backend!

**For detailed hosting instructions, see [HOSTING-GUIDE.md](HOSTING-GUIDE.md)**

---

## 📋 Troubleshooting

### Can't Access from Phone?
- ✅ Both devices on same WiFi?
- ✅ Windows Firewall blocking? (Allow Node.js if prompted)
- ✅ Try restarting the servers

### Want to Share with Others?
- Use hosting options above for public access
- Or use ngrok: `npx ngrok http 5173` for temporary public URL

---

**💡 Pro Tip:** Bookmark the URL on your phone's home screen for native app-like experience!
