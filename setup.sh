#!/bin/bash

# Affiliate MCP Server Quick Start Script

echo "🚀 Affiliate MCP Server Setup"
echo "============================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if Redis is installed
if ! command -v redis-cli &> /dev/null; then
    echo "⚠️  Redis is not installed. The server will run but caching will be disabled."
    echo "   To install Redis: https://redis.io/download"
else
    echo "✅ Redis detected"
    # Start Redis if not running
    if ! pgrep -x "redis-server" > /dev/null; then
        echo "Starting Redis..."
        redis-server --daemonize yes
    fi
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your API credentials before running the server."
    echo "   Required credentials:"
    echo "   - Amazon PA-API (Access Key, Secret Key, Associate Tag)"
    echo "   - Anthropic API Key (for Claude Sonnet 4)"
    echo "   - OpenAI API Key (optional, for DALL-E image generation)"
    echo "   - WhatsApp Business API credentials"
    echo "   - Instagram Business Account credentials"
    echo ""
    read -p "Press Enter to continue after updating .env file..."
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Run tests
echo ""
echo "🧪 Running tests..."
npm test

# Success message
echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the MCP server:"
echo "  npm start"
echo ""
echo "To use with your MCP client, add to your configuration:"
echo '  {
    "mcpServers": {
      "affiliate-server": {
        "command": "node",
        "args": ["'$(pwd)'/src/index.js"]
      }
    }
  }'
echo ""
echo "For more information, see README.md"
