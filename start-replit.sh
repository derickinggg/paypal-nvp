#!/bin/bash

echo "🚀 Starting PayPal NVP Express Checkout on Replit..."

# Check if we're in Replit
if [ -n "$REPL_ID" ]; then
    echo "✅ Running in Replit environment"
    echo "🌐 Repl URL: https://$REPL_SLUG.$REPL_OWNER.repl.co"
else
    echo "⚠️  Not in Replit - this script is designed for Replit"
fi

echo ""
echo "📦 Installing dependencies..."
npm run install-all

echo ""
echo "🚀 Starting the app..."
echo "   Frontend: React app on port 3000"
echo "   Backend: Express server on port 3000"
echo ""

# Start the app
npm start
