#!/bin/bash

echo "🚀 Setting up PayPal NVP Express Checkout on Replit..."

# Check if we're in Replit environment
if [ -n "$REPL_ID" ]; then
    echo "✅ Detected Replit environment"
    echo "🆔 Repl ID: $REPL_ID"
else
    echo "⚠️  Not running in Replit environment"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo "🔧 Installing server dependencies..."
cd server
npm install
cd ..

echo "🎨 Installing client dependencies..."
cd client
npm install
cd ..

echo "✅ All dependencies installed!"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Replit Environment Configuration
NODE_ENV=development
PORT=3000
REPLIT=true

# PayPal Configuration (set these in Replit secrets)
PAYPAL_ENV=sandbox
PAYPAL_NVP_VERSION=204.0

# Replit-specific settings
REPLIT_URL=https://\$REPL_SLUG.\$REPL_OWNER.repl.co
EOF
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🎯 Setup complete! Your app is ready to run on Replit."
echo ""
echo "🚀 To start your app:"
echo "   1. Click the 'Run' button in Replit"
echo "   2. Or run: npm run replit"
echo ""
echo "🌐 Your app will be available at:"
echo "   https://\$REPL_SLUG.\$REPL_OWNER.repl.co"
echo ""
echo "🔧 To configure PayPal credentials:"
echo "   1. Go to Replit Secrets (Tools → Secrets)"
echo "   2. Add your PayPal NVP credentials"
echo "   3. Restart the app"
echo ""
echo "📚 For more help, check VERCEL_DEPLOYMENT_FIX.md"
