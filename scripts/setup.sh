#!/bin/bash

# Novel AI JP Setup Script

set -e

echo "🚀 Novel AI JP Setup"
echo "===================="
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    echo "   Install from: https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js: $(node --version)"

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    echo "⚠️  pnpm not found. Installing..."
    npm install -g pnpm
fi
echo "✅ pnpm: $(pnpm --version)"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    echo "   Install from: https://www.python.org/"
    exit 1
fi
echo "✅ Python: $(python3 --version)"

# Check Docker (optional)
if command -v docker &> /dev/null; then
    echo "✅ Docker: $(docker --version)"
else
    echo "⚠️  Docker not found. You'll need to run services manually."
fi

echo ""
echo "📦 Installing dependencies..."

# Install frontend dependencies
echo "   Installing web dependencies..."
cd apps/web
pnpm install
cd ../..

# Install backend dependencies
echo "   Installing API dependencies..."
cd apps/api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ../..

echo ""
echo "⚙️  Setting up environment..."

# Create .env if not exists
if [ ! -f .env ]; then
    cp .env.example .env
    echo "   Created .env file from .env.example"
    echo "   ⚠️  Please edit .env and add your API keys"
else
    echo "   .env already exists"
fi

echo ""
echo "📁 Creating directories..."

# Create data directories
mkdir -p apps/api/data
mkdir -p ml/datasets
mkdir -p ml/models

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env and add your API keys"
echo "2. Start the application:"
echo ""
echo "   # Using Docker (recommended)"
echo "   docker-compose up -d"
echo ""
echo "   # Or run locally"
echo "   pnpm dev"
echo ""
echo "3. Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "📖 Documentation: docs/"
echo "🐛 Issues: https://github.com/parkwoo/novel-ai-jp/issues"
echo ""
