#!/bin/bash

echo "🚀 Starting Affiliate Marketing System..."
echo ""

# Function to cleanup on exit
cleanup() {
    echo -e "\n🛑 Shutting down..."
    kill $API_PID $FRONTEND_PID 2>/dev/null
    exit
}

# Set trap for cleanup
trap cleanup INT TERM

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running."
    
    # Check if MongoDB is installed
    if brew list mongodb-community &>/dev/null; then
        echo "Starting MongoDB..."
        brew services start mongodb-community
        sleep 2
    else
        echo "❌ MongoDB is not installed."
        echo ""
        echo "To install MongoDB, run:"
        echo "  ./fix-mongodb.sh"
        echo ""
        echo "Or manually:"
        echo "  brew tap mongodb/brew"
        echo "  brew install mongodb-community"
        echo "  brew services start mongodb-community"
        echo ""
        echo "Continuing without MongoDB (some features won't work)..."
    fi
else
    echo "✅ MongoDB is running"
fi

# Start API server
echo "🔧 Starting API server on port 3000..."
npm run api &
API_PID=$!

# Wait for API to be ready
echo "Waiting for API server to start..."
sleep 5

# Check if API is running
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ API server is running"
else
    echo "⚠️  API server may have issues, check the logs above"
fi

# Start frontend
echo "🎨 Starting frontend on port 5173..."
cd frontend && npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Services started!"
echo ""
echo "📱 Frontend: http://localhost:5173"
echo "🔧 API: http://localhost:3000/health"
echo "💾 MongoDB: mongodb://localhost:27017 (if running)"
echo ""
echo "If you see errors, check:"
echo "1. MongoDB installation: ./fix-mongodb.sh"
echo "2. API logs above for any issues"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for processes
wait
