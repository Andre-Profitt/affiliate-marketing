#!/bin/bash

echo "🔍 Final verification of icon imports..."
echo ""

# Check for any remaining incorrect imports
ERRORS=0

echo "Checking CIcon imports..."
if grep -r "import CIcon from '@coreui/icons'" src/ 2>/dev/null; then
  echo "❌ Found incorrect CIcon imports"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ All CIcon imports are correct"
fi

echo ""
echo "Checking icon name imports..."
if grep -r "from '@coreui/icons-react'" src/ | grep -v "import CIcon" 2>/dev/null; then
  echo "❌ Found incorrect icon name imports"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ All icon name imports are correct"
fi

if [ $ERRORS -eq 0 ]; then
  echo ""
  echo "✅ All imports verified! Starting dev server..."
  echo ""
  npm run dev
else
  echo ""
  echo "❌ Found $ERRORS import errors. Please fix before running."
fi
