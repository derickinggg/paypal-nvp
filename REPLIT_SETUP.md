# 🚀 Replit Setup Guide - Card Checkout App

## 📋 Quick Start for Replit

### 1. **Import to Replit**
1. Go to [replit.com](https://replit.com)
2. Click "Create Repl"
3. Choose "Import from GitHub" or "Upload files"
4. Upload all the project files

### 2. **Environment Setup**
1. In Replit, go to the "Secrets" tab (lock icon)
2. Add these environment variables:
   ```
   PAYPAL_CLIENT_ID=your_sandbox_client_id
   PAYPAL_SECRET=your_sandbox_secret
   ```

### 3. **Install Dependencies**
Run this command in the Replit shell:
```bashnpm run install-all

```

### 4. **Build the App**
```bash
npm run build
```

### 5. **Run the App**
Click the "Run" button or use:
```bash
npm start
```

## 🔧 Replit-Specific Configuration

### **Port Configuration**
- The app automatically uses Replit's port system
- Frontend: Port 3000 (React)
- Backend: Port 5000 (Express)
- Replit will show the app in the webview

### **File Structure for Replit**
```
card-checkout-app/
├── .replit              # Replit configuration
├── replit.nix          # Nix dependencies
├── package.json        # Root package.json
├── client/             # React frontend
├── server/             # Node.js backend
├── env.example         # Environment template
└── README.md           # Documentation
```

## 🎯 Features Optimized for Replit

### **Automatic Port Detection**
- Uses `process.env.PORT` for Replit's port system
- Automatically serves React build files
- Handles routing for single-page application

### **Development Workflow**
- **Development Mode**: `npm run dev` (with hot reload)
- **Production Mode**: `npm start` (built version)
- **Build Only**: `npm run build`

### **Environment Variables**
- Use Replit's "Secrets" feature for sensitive data
- Automatically loads `.env` file if present
- Fallback to Replit environment variables

## 🚀 Deployment Steps

### **Step 1: Create Repl**
1. Go to [replit.com](https://replit.com)
2. Click "Create Repl"
3. Choose "Node.js" as template
4. Name your repl (e.g., "card-checkout-app")

### **Step 2: Upload Files**
1. Download all project files
2. Upload them to your Repl
3. Or use Git integration to clone the repository

### **Step 3: Configure Environment**
1. Go to "Secrets" tab
2. Add PayPal credentials:
   ```
   PAYPAL_CLIENT_ID=your_sandbox_client_id
   PAYPAL_SECRET=your_sandbox_secret
   ```

### **Step 4: Install & Build**
```bash
# Install all dependencies
npm run install-all

# Build the React app
npm run build
```

### **Step 5: Run**
Click the "Run" button or use:
```bash
npm start
```

## 🔍 Troubleshooting

### **Common Issues**

#### Issue: "Module not found"
**Solution**: Run `npm run install-all` to install all dependencies

#### Issue: "Port already in use"
**Solution**: Replit handles port management automatically

#### Issue: "PayPal API errors"
**Solution**: 
1. Check your PayPal credentials in Secrets
2. Make sure you're using sandbox credentials
3. Verify the credentials are correct

#### Issue: "Build fails"
**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm run install-all
```

### **Replit-Specific Tips**

1. **Use the Shell**: Run commands in the Replit shell
2. **Check Console**: View logs in the console tab
3. **Webview**: Your app appears in the webview tab
4. **Files**: Manage files in the files tab
5. **Secrets**: Store environment variables securely

## 📱 Testing on Replit

### **Test Cards for Sandbox**
- **Visa**: `4111111111111111`
- **Mastercard**: `5555555555554444`
- **CVV**: Any 3 digits (e.g., `123`)
- **Expiry**: Any future date (e.g., `12/25`)

### **Test Billing Information**
- **Name**: Any valid name
- **Email**: Any valid email format
- **Address**: Any valid address
- **ZIP**: Any valid ZIP code

## 🎉 Success Indicators

When everything is working:
- ✅ App loads in Replit webview
- ✅ Checkout form appears
- ✅ Can fill out billing information
- ✅ Can enter card details
- ✅ Payment processing works
- ✅ Success/error messages display

## 🔗 Useful Links

- [Replit Documentation](https://docs.replit.com/)
- [PayPal Developer Dashboard](https://developer.paypal.com/)
- [React Documentation](https://reactjs.org/docs/)
- [Express.js Documentation](https://expressjs.com/)

---

**🎯 Pro Tip**: Use Replit's "Always On" feature to keep your app running 24/7 for testing! 