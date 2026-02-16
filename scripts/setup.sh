#!/bin/bash
# =============================================================================
# Setup Script for EDUIO Test Recorder
# =============================================================================

set -e

echo "🚀 Setting up EDUIO Test Recorder..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your API keys before proceeding"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma Client
echo "🗄️  Generating Prisma Client..."
npx prisma generate

# Create database
echo "🗄️  Initializing database..."
npx prisma db push

# Build application
echo "🏗️  Building application..."
npm run build

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your API keys"
echo "2. Run: npm run dev (development)"
echo "3. Or: docker-compose up -d (production)"
echo ""
echo "Dashboard will be available at: http://localhost:3000"
