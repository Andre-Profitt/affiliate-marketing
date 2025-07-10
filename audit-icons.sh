#!/bin/bash

echo "🔍 Auditing all CoreUI icon imports..."

cd frontend

echo -e "\n📋 Rule: CIcon component must be imported from '@coreui/icons-react'"
echo "📋 Rule: Icon names (cilXxx) must be imported from '@coreui/icons'"

echo -e "\n✅ Checking CIcon imports..."
grep -r "import CIcon" src/ | grep -v "from '@coreui/icons-react'" && echo "❌ Found incorrect CIcon imports!" || echo "✅ All CIcon imports are correct"

echo -e "\n✅ Checking icon name imports..."
grep -r "cil[A-Z]" src/ | grep "from" | grep -v "from '@coreui/icons'" | grep -v "// " && echo "❌ Found incorrect icon imports!" || echo "✅ All icon imports are correct"

echo -e "\n📊 Summary of all icon imports:"
echo "CIcon imports:"
grep -r "import CIcon" src/ | wc -l

echo -e "\nIcon name imports:"
grep -r "} from '@coreui/icons'" src/ | wc -l

echo -e "\n✅ Audit complete!"
EOF && chmod +x audit-icons.sh
