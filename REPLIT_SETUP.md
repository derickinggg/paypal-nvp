# �� Replit Setup Guide for PayPal NVP Express Checkout

## 🎯 **Quick Start on Replit**

### **Step 1: Fork/Create Repl**
1. Go to [replit.com](https://replit.com)
2. Click "Create Repl"
3. Choose "Import from GitHub"
4. Enter your repository URL: `derickinggg/paypal-nvp`
5. Click "Import from GitHub"

### **Step 2: Run Setup Script**
```bash
chmod +x setup-replit.sh
./setup-replit.sh
```

### **Step 3: Start the App**
Click the **"Run"** button in Replit, or run:
```bash
npm run replit
```

## 🔧 **Replit Configuration Files**

### **`.replit`** - Main Replit config
- Sets run command to `npm start`
- Configures entry point as `server/index.js`
- Sets up language support for JS, CSS, HTML

### **`replit.nix`** - Dependencies
- Node.js 18.x
- TypeScript language server
- Git and bash tools

### **`setup-replit.sh`** - Setup script
- Installs all dependencies
- Creates environment file
- Configures Replit-specific settings

## 🌐 **How It Works on Replit**

### **Port Configuration**
- **Frontend**: Port 3000 (React app)
- **Backend**: Port 3000 (Express server)
- **Replit URL**: `https://$REPL_SLUG.$REPL_OWNER.repl.co`

### **File Structure**
```
/
├── .replit              # Replit configuration
├── replit.nix          # Nix dependencies
├── setup-replit.sh     # Setup script
├── package.json        # Main dependencies
├── server/             # Backend Express server
│   ├── index.js       # Server entry point
│   └── package.json   # Server dependencies
└── client/            # React frontend
    ├── src/           # React components
    └── package.json   # Client dependencies
```

## 🚀 **Running Your App**

### **Option 1: Click Run Button**
1. Click the **"Run"** button in Replit
2. Wait for dependencies to install
3. App starts automatically

### **Option 2: Terminal Commands**
```bash
# Install all dependencies
npm run install-all

# Start both frontend and backend
npm start

# Or use Replit-specific command
npm run replit
```

### **Option 3: Separate Processes**
```bash
# Terminal 1: Start backend
npm run replit-server

# Terminal 2: Start frontend
npm run replit-client
```

## 🔑 **PayPal Configuration**

### **Set Environment Variables**
1. Go to **Tools → Secrets** in Replit
2. Add these secrets:
   ```
   PAYPAL_ENV=sandbox
   PAYPAL_NVP_VERSION=204.0
   ```

### **Or Use .env File**
The setup script creates a `.env` file automatically.

## 📱 **Accessing Your App**

### **Local Development**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3000/api`

### **Replit Production**
- **Main URL**: `https://$REPL_SLUG.$REPL_OWNER.repl.co`
- **API Endpoints**: `https://$REPL_SLUG.$REPL_OWNER.repl.co/api/nvp/*`

## 🐛 **Troubleshooting**

### **Common Issues**

#### **1. Port Already in Use**
```bash
# Kill existing processes
pkill -f node
# Or restart the repl
```

#### **2. Dependencies Not Installed**
```bash
npm run install-all
```

#### **3. PayPal Module Not Found**
```bash
cd server
npm install paypal-nvp
cd ..
```

#### **4. CORS Errors**
- Check that both frontend and backend are running
- Verify API calls use correct URLs

### **Debug Commands**
```bash
# Check running processes
ps aux | grep node

# Check ports
netstat -tulpn | grep :3000

# View logs
npm run replit-server
```

## 🔄 **Development Workflow**

### **1. Make Changes**
- Edit files in Replit editor
- Changes auto-save

### **2. Test Changes**
- Click "Run" to restart
- Or use `Ctrl+C` then `npm start`

### **3. Deploy Changes**
- Commit to GitHub
- Replit auto-updates

## 📊 **Monitoring & Logs**

### **View Logs**
- **Console**: Shows npm output
- **Terminal**: Run commands manually
- **Replit Logs**: Tools → Logs

### **Performance**
- **Memory**: Check in Replit stats
- **CPU**: Monitor usage in real-time
- **Network**: View API calls

## 🌟 **Replit Features You Can Use**

### **1. Multiplayer**
- Invite collaborators
- Real-time editing
- Chat in comments

### **2. Git Integration**
- Commit directly from Replit
- Push to GitHub
- Branch management

### **3. Secrets Management**
- Store API keys securely
- Environment variables
- No hardcoded secrets

### **4. Webview**
- Preview your app
- Test on different devices
- Debug frontend issues

## 🎉 **Success Indicators**

Your app is working correctly when:
- ✅ **Console shows**: "🚀 Server running on port 3000"
- ✅ **Frontend loads**: Checkout form appears
- ✅ **API responds**: `/api/nvp/debug` returns data
- ✅ **PayPal integration**: Can create checkout sessions

## 📞 **Need Help?**

1. **Check Replit logs**: Tools → Logs
2. **Restart the repl**: Click "Run" again
3. **Check dependencies**: `npm run install-all`
4. **Verify configuration**: Check `.replit` and `replit.nix`

## 🚀 **Next Steps**

After successful setup:
1. **Test the checkout flow**
2. **Configure PayPal credentials**
3. **Customize the UI**
4. **Deploy to production**

Your PayPal NVP Express Checkout app is now ready to run on Replit! 🎯 