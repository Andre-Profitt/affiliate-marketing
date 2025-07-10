#!/bin/bash

echo "🚀 Starting Affiliate Dashboard"
echo "=============================="

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if Redis is running
if command -v redis-cli &> /dev/null; then
    if redis-cli ping > /dev/null 2>&1; then
        echo "✅ Redis is running"
    else
        echo "⚠️  Starting Redis..."
        redis-server --daemonize yes
    fi
else
    echo "⚠️  Redis not found. Dashboard will work but without caching."
fi

# Check environment variables
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "Please create .env file with your API credentials:"
    echo "  cp .env.example .env"
    echo "  Then edit .env with your credentials"
    exit 1
fi

# Start the web server
echo ""
echo "🌐 Starting web server..."
echo "Dashboard will be available at: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Run the web server
node web/server.js
