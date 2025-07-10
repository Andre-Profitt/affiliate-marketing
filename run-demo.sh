#!/bin/bash

echo "🎮 Starting Affiliate Dashboard in DEMO MODE"
echo "==========================================="

cd "$(dirname "$0")"

# Use the standalone server that doesn't require other services
echo ""
echo "🚀 Starting demo dashboard..."
echo "📍 URL: http://localhost:3001"
echo ""
echo "Demo includes:"
echo "✅ 10 trending products (Amazon & Shopee)"
echo "✅ Full link generation"
echo "✅ Campaign creation"
echo "✅ AI insights"
echo ""
echo "Press Ctrl+C to stop"
echo ""

node web/server-standalone.js
