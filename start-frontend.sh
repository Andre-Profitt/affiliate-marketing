#!/bin/bash

# Start Frontend Script
echo "🚀 Starting Affiliate Marketing Dashboard Frontend..."

# Navigate to frontend directory
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the development server
echo "✨ Starting React development server..."
echo "📱 Dashboard will be available at: http://localhost:5173"
echo ""
npm run dev
