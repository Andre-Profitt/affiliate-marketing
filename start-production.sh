#!/bin/bash

echo "🚀 Starting Production Affiliate Dashboard"
echo "========================================"

cd "$(dirname "$0")"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Creating .env from production template..."
    cp .env.production .env
    echo "📝 Please edit .env with your credentials:"
    echo "   - Shopee Affiliate ID"
    echo "   - Anthropic API Key (optional)"
    echo ""
    echo "Then run this script again."
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing production dependencies..."
    npm install axios express cors dotenv winston
fi

# Optional: Start Redis if available
if command -v redis-cli &> /dev/null; then
    if redis-cli ping > /dev/null 2>&1; then
        echo "✅ Redis cache is running"
    else
        echo "🔄 Starting Redis cache..."
        redis-server --daemonize yes
    fi
fi

# Start the production server
echo ""
echo "🌐 Starting production server..."
echo "📍 Dashboard: http://localhost:3001"
echo "📊 API Status: http://localhost:3001/api/status"
echo ""
echo "Features:"
echo "✅ Live Shopee product data"
echo "✅ Real-time prices and discounts"
echo "✅ Affiliate link generation"
echo "✅ Content creation tools"
echo "⏳ Amazon (pending approval)"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Run production server
node web/server-production.js
