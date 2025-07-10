# Frontend Debugging Guide

## 🔍 Blank Screen Debug Steps

If you're seeing a blank screen, follow these steps:

### 1. Check Browser Console
Open Chrome/Firefox DevTools (F12) and check:
- **Console tab**: Look for red error messages
- **Network tab**: Check if all files are loading (especially .js and .css files)

### 2. Common Issues and Fixes

#### Issue: Module not found errors
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

#### Issue: SCSS compilation error
Try commenting out the scss import temporarily:
```javascript
// In src/App.jsx and src/main.jsx
// import './scss/style.scss';
```

#### Issue: Router not working
The app now redirects from / to /dashboard automatically.
Try accessing directly: http://localhost:5173/dashboard

### 3. Test with Simple Component
To verify React is working, temporarily modify src/main.jsx:
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';

const TestApp = () => (
  <div style={{ padding: '20px' }}>
    <h1>React is working!</h1>
    <p>If you see this, the issue is with the components.</p>
  </div>
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<TestApp />);
```

### 4. Check for Console Logs
With the latest update, you should see in the console:
- "Main.jsx is loading"
- "App component is rendering"
- "React app should be mounted"

If you don't see these, React isn't loading at all.

### 5. Try the Simple App
```bash
cd frontend
cp src/App-simple.jsx src/App.jsx
npm run dev
```

This loads a basic version without CoreUI to isolate the issue.

## 🛠️ Quick Fixes to Try

1. **Clear Vite cache**:
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

2. **Check Node version**:
   ```bash
   node --version  # Should be 16+ 
   ```

3. **Try production build**:
   ```bash
   npm run build
   npm run preview
   ```

## 📋 What to Report

If still not working, please share:
1. Browser console errors (red text)
2. Network tab - any failed requests?
3. What exactly do you see? Completely white? Any text at all?
4. Browser and version you're using

The ErrorBoundary component will now catch and display any React errors on screen.


## 🚨 Quick Test - Try This:

To test if CoreUI is working, temporarily use the minimal app:

```bash
cd frontend
# Backup current App
cp src/App.jsx src/App.jsx.full
# Use minimal version
cp src/MinimalApp.jsx src/App.jsx
# Restart
npm run dev
```

If you see a styled card, CoreUI works and the issue is with routing.
If still blank, check browser console for errors.
