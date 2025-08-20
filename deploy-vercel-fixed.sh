#!/bin/bash

echo "🚀 Deploying Fixed PayPal NVP Express Checkout to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Install API dependencies
echo "📦 Installing API dependencies..."
cd api
npm install
cd ..

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
echo "🔧 What was fixed:"
echo "   ✅ Self-contained API endpoints (no import issues)"
echo "   ✅ Proper PayPal NVP API integration"
echo "   ✅ Better error handling and logging"
echo "   ✅ Correct return/cancel URL handling"
echo ""
echo "🧪 Test your app:"
echo "   1. Visit: https://paypal-nvp-express-checkout.vercel.app"
echo "   2. Enter your PayPal NVP credentials"
echo "   3. Test credentials with 'Test Credentials' button"
echo "   4. Try creating a checkout session"
echo ""
echo "🔧 To check deployment status: vercel ls"
echo "📊 To view logs: vercel logs"
