#!/bin/bash

# Fix CoreUI imports script
echo "🔧 Fixing CoreUI imports..."

cd frontend

# Fix all @coreui/icons imports to @coreui/icons-react
find src -name "*.jsx" -o -name "*.js" | while read file; do
  if grep -q "@coreui/icons\"" "$file"; then
    echo "Fixing imports in: $file"
    sed -i '' 's/@coreui\/icons"/@coreui\/icons-react"/g' "$file"
  fi
done

echo "✅ Import fixes complete!"
echo ""
echo "Now run:"
echo "  cd frontend"
echo "  npm run dev"
EOF && chmod +x fix-imports.sh
