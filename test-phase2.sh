#!/bin/bash

echo "🧪 Testing Phase 2 Implementation..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Check if API server is running
echo "Checking API server..."
if curl -s http://localhost:3000/health > /dev/null; then
    echo -e "${GREEN}✓ API server is running${NC}"
else
    echo -e "${RED}✗ API server is not running${NC}"
    echo "Run: npm run api"
    exit 1
fi

# Test authentication (using demo credentials)
echo -e "\nTesting authentication..."
AUTH_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}' 2>/dev/null)

if echo "$AUTH_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✓ Authentication working${NC}"
    TOKEN=$(echo "$AUTH_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
else
    echo -e "${RED}✗ Authentication failed${NC}"
    echo "Create a test user first: npm run api, then register"
    exit 1
fi

# Test product search
echo -e "\nTesting product search..."
SEARCH_RESPONSE=$(curl -s "http://localhost:3000/api/affiliate/products/search?q=notebook" \
  -H "Authorization: Bearer $TOKEN")

if echo "$SEARCH_RESPONSE" | grep -q "products"; then
    echo -e "${GREEN}✓ Product search working${NC}"
    PRODUCT_COUNT=$(echo "$SEARCH_RESPONSE" | grep -o '"products":\[[^]]*' | grep -o '{' | wc -l)
    echo "  Found $PRODUCT_COUNT products"
else
    echo -e "${RED}✗ Product search failed${NC}"
    echo "$SEARCH_RESPONSE"
fi

# Test trending products
echo -e "\nTesting trending products..."
TRENDING_RESPONSE=$(curl -s "http://localhost:3000/api/affiliate/products/trending" \
  -H "Authorization: Bearer $TOKEN")

if echo "$TRENDING_RESPONSE" | grep -q "products"; then
    echo -e "${GREEN}✓ Trending products working${NC}"
else
    echo -e "${RED}✗ Trending products failed${NC}"
fi

echo -e "\n${GREEN}Phase 2 testing complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Add your Shopee affiliate credentials to .env"
echo "2. Open frontend: http://localhost:5173"
echo "3. Search for products and generate affiliate links"
echo "4. Check your affiliate dashboard for tracking"
