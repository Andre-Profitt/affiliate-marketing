#!/bin/bash

echo "🚑 Emergency fix - using safe dashboard version..."

cd frontend

# Backup current dashboard
cp src/views/dashboard/Dashboard.jsx src/views/dashboard/Dashboard.jsx.full

# Use safe version
cp src/views/dashboard/Dashboard-safe.jsx src/views/dashboard/Dashboard.jsx

echo "✅ Using simplified dashboard without problematic icons"
echo "Refresh your browser to see if it works!"
