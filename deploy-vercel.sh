#!/bin/bash

echo "🚀 Deploying PayPal NVP Express Checkout to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Build the client
echo "📦 Building React client..."
cd client
npm run build
cd ..

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "🔗 Your app should be available at: https://paypal-nvp-express-checkout.vercel.app"
echo ""
echo "⚠️  IMPORTANT: Make sure your backend is also deployed!"
echo "   - Option 1: Use the updated vercel.json (recommended)"
echo "   - Option 2: Deploy backend separately to Railway/Render/Heroku"
echo ""
echo "🔧 To check deployment status: vercel ls"
