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
    echo "⚠️  MongoDB is not running. Starting it..."
    if command -v brew &> /dev/null; then
        brew services start mongodb-community
    else
        echo "❌ Please start MongoDB manually"
        exit 1
    fi
fi

# Start API server
echo "🔧 Starting API server on port 3000..."
npm run api &
API_PID=$!

# Wait for API to be ready
sleep 3

# Start frontend
echo "🎨 Starting frontend on port 5173..."
cd frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ All services started!"
echo ""
echo "📱 Frontend: http://localhost:5173"
echo "🔧 API: http://localhost:3000"
echo "💾 MongoDB: mongodb://localhost:27017"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for processes
wait
