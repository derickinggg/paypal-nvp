#!/bin/bash

echo "🚀 Deploying PayPal NVP Express Checkout to public URL..."

# Build the React app
echo "📦 Building React app..."
cd client
npm run build
cd ..

# Install serve globally if not already installed
if ! command -v serve &> /dev/null; then
    echo "📥 Installing serve package..."
    npm install -g serve
fi

# Create a simple deployment configuration
echo "🌐 Creating deployment configuration..."

# Create a vercel.json for easy deployment
cat > vercel.json << EOF
{
  "version": 2,
  "builds": [
    {
      "src": "client/build/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/client/build/index.html"
    }
  ],
  "env": {
    "REACT_APP_API_URL": "https://your-backend-url.com"
  }
}
EOF

echo "✅ Deployment configuration created!"
echo ""
echo "🌐 To deploy to Vercel:"
echo "   1. Go to https://vercel.com"
echo "   2. Sign up/Login with GitHub"
echo "   3. Import your repository: https://github.com/derickinggg/paypal-nvp"
echo "   4. Deploy automatically"
echo ""
echo "🌐 To deploy to Netlify:"
echo "   1. Go to https://netlify.com"
echo "   2. Sign up/Login with GitHub"
echo "   3. Deploy from Git → Choose your repository"
echo "   4. Build command: cd client && npm run build"
echo "   5. Publish directory: client/build"
echo ""
echo "🌐 To deploy to GitHub Pages:"
echo "   1. Push your code to GitHub"
echo "   2. Go to repository Settings → Pages"
echo "   3. Source: Deploy from a branch"
echo "   4. Branch: main, folder: /client/build"
echo ""
echo "🔧 For local testing with public access:"
echo "   ngrok http 3000"
echo "   or"
echo "   serve -s client/build -l 3000"
echo ""
echo "📱 Your app is ready for deployment!"
