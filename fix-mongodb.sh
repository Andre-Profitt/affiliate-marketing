#!/bin/bash

echo "🔧 Fixing MongoDB installation..."

# Check if brew is installed
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew not installed. Please install from https://brew.sh"
    exit 1
fi

# Add MongoDB tap
echo "Adding MongoDB tap..."
brew tap mongodb/brew

# Install MongoDB Community
echo "Installing MongoDB Community..."
brew install mongodb-community

# Start MongoDB
echo "Starting MongoDB..."
brew services start mongodb-community

echo "✅ MongoDB installation complete!"
echo ""
echo "MongoDB is now running at: mongodb://localhost:27017"
