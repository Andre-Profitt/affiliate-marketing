#!/bin/bash

echo "🔄 Restarting frontend with fresh install..."

cd frontend

# Kill any running dev servers
echo "Stopping any running servers..."
pkill -f "vite" || true

# Clear caches
echo "Clearing caches..."
rm -rf node_modules/.vite
rm -rf dist

# Reinstall dependencies
echo "Reinstalling dependencies..."
rm -rf node_modules package-lock.json
npm install

# Start dev server
echo "Starting development server..."
echo ""
echo "🌐 Opening http://localhost:5173"
echo "📋 Check browser console (F12) for any errors"
echo ""
npm run dev
EOF && chmod +x restart-frontend.sh
