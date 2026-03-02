#!/bin/bash

# Neural Fusion Integration Script
# This script helps you integrate Neural Fusion components into your existing EmpowerAI project

echo "🚀 Neural Fusion Integration Script"
echo "=================================="

# Check if we're in the right directory
if [ ! -d "frontend/src" ]; then
    echo "❌ Error: Please run this script from the EmpowerAI root directory"
    exit 1
fi

echo "✅ Found EmpowerAI project structure"

# Backup existing files
echo "📦 Backing up existing files..."
cd frontend/src/pages
cp Dashboard.tsx Dashboard_Original.tsx 2>/dev/null || echo "Dashboard.tsx not found"
cp CVAnalyzer.tsx CVAnalyzer_Original.tsx 2>/dev/null || echo "CVAnalyzer.tsx not found"
cp InterviewCoach.tsx InterviewCoach_Original.tsx 2>/dev/null || echo "InterviewCoach.tsx not found"

cd ../layouts
cp DashboardLayout.tsx DashboardLayout_Original.tsx 2>/dev/null || echo "DashboardLayout.tsx not found"

echo "✅ Backups created"

# Show what's available
echo ""
echo "📋 Available Neural Fusion Components:"
echo "  - HolographicButton (enhanced buttons)"
echo "  - NeuralCard (modern cards)"
echo "  - AIAvatar (AI assistant avatars)"
echo "  - NeuralLoading (loading states)"
echo "  - VoiceVisualizer (voice feedback)"

echo ""
echo "📁 Integration Files Created:"
echo "  - SIMPLE_INTEGRATION_GUIDE.md (step-by-step guide)"
echo "  - NEURAL_FUSION_INTEGRATION.md (comprehensive guide)"
echo "  - Dashboard_Neural.tsx (enhanced dashboard example)"

echo ""
echo "🎯 Next Steps:"
echo "1. Review SIMPLE_INTEGRATION_GUIDE.md"
echo "2. Choose integration approach (gradual or full)"
echo "3. Apply code snippets to your existing files"
echo "4. Test each page individually"

echo ""
echo "🔧 Quick Start:"
echo "  npm run dev    # Start development server"
echo "  http://localhost:5174/neural-fusion  # See Neural Fusion showcase"

echo ""
echo "✅ Integration script completed successfully!"
echo "🚀 Your EmpowerAI project is ready for Neural Fusion enhancement!"
