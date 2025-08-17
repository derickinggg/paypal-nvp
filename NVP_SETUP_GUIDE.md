# PayPal NVP API Setup Guide

This guide will help you set up PayPal's Classic NVP (Name-Value Pair) API credentials for the Express Checkout integration.

## 🔑 What You Need

For the NVP Express Checkout to work, you need **three credentials**:
- **Username** (API Username)
- **Password** (API Password)  
- **Signature** (API Signature)

**⚠️ Important**: These are DIFFERENT from the Client ID and Secret used for PayPal v2 API!

## 📍 Where to Find NVP Credentials

### Step 1: Access PayPal Developer Dashboard
1. Go to [developer.paypal.com](https://developer.paypal.com)
2. Log in to your PayPal developer account
3. Make sure you're in **Sandbox** mode (toggle in top right)

### Step 2: Navigate to API Credentials
1. Click on **"Apps & Credentials"** in the left sidebar
2. Look for **"API access → NVP/SOAP (Classic)"** section
3. Click **"Manage API Credentials"**

### Step 3: Get Your Credentials
You'll see a section called **"API Credentials"** with three fields:

```
API Username: your_username_sandbox
API Password: your_password_here
API Signature: your_signature_here
```

**Copy all three values** - you'll need them for your `.env` file.

## ⚙️ Environment Configuration

### 1. Update Your .env File
Add these lines to your `.env` file:

```bash
# PayPal NVP API Credentials
PAYPAL_ENV=sandbox
PAYPAL_NVP_VERSION=204.0
PAYPAL_USER=your_username_sandbox
PAYPAL_PWD=your_password_here
PAYPAL_SIGNATURE=your_signature_here
BASE_URL=http://localhost:5000
```

### 2. Replace the Placeholder Values
- `your_username_sandbox` → Your actual API Username
- `your_password_here` → Your actual API Password  
- `your_signature_here` → Your actual API Signature

## 🧪 Testing the Integration

### 1. Start Your Server
```bash
cd server
npm start
```

### 2. Test the NVP Endpoint
```bash
curl -X POST http://localhost:5000/api/nvp/create \
  -H "Content-Type: application/json" \
  -d '{"amount": "19.99", "currency": "USD"}'
```

**Expected Response:**
```json
{
  "token": "EC-123456789",
  "redirectUrl": "https://www.sandbox.paypal.com/...",
  "success": true
}
```

### 3. Test the Full Flow
1. Open your app in the browser
2. Navigate to "NVP Express Checkout"
3. Enter an amount and click "Pay with PayPal Express"
4. You should be redirected to PayPal Sandbox
5. Complete the payment with a sandbox account
6. Return to your success page

## 🔍 Troubleshooting

### Common Issues & Solutions

#### 1. "Invalid credentials" Error
- **Problem**: Wrong username/password/signature
- **Solution**: Double-check your credentials in the `.env` file
- **Verify**: Make sure you copied from NVP/SOAP section, not Apps & Credentials

#### 2. "Version not supported" Error
- **Problem**: PayPal API version issue
- **Solution**: Try changing `PAYPAL_NVP_VERSION` to `200.0` in your `.env`
- **Alternative**: Use `204.0` (latest supported version)

#### 3. "Method not allowed" Error
- **Problem**: Wrong API endpoint
- **Solution**: Ensure `PAYPAL_ENV=sandbox` for testing
- **Verify**: Check that your server is using the correct NVP endpoint

#### 4. CORS Issues
- **Problem**: Frontend can't reach backend
- **Solution**: Make sure your server is running on port 5000
- **Verify**: Check that `BASE_URL=http://localhost:5000` in your `.env`

### Debug Steps

1. **Check Server Logs**
   ```bash
   cd server
   npm run dev
   ```
   Look for error messages when calling `/api/nvp/create`

2. **Verify Environment Variables**
   ```bash
   cd server
   node -e "require('dotenv').config(); console.log('NVP User:', process.env.PAYPAL_USER)"
   ```

3. **Test PayPal Connection**
   The server will log NVP API calls - watch for success/failure messages

## 🌐 Sandbox vs Live

### For Testing (Sandbox)
```bash
PAYPAL_ENV=sandbox
PAYPAL_USER=your_username_sandbox
PAYPAL_PWD=your_password_sandbox
PAYPAL_SIGNATURE=your_signature_sandbox
```

### For Production (Live)
```bash
PAYPAL_ENV=live
PAYPAL_USER=your_username_live
PAYPAL_PWD=your_password_live
PAYPAL_SIGNATURE=your_signature_live
```

**⚠️ Never use live credentials for testing!**

## 📚 Additional Resources

- [PayPal NVP API Documentation](https://developer.paypal.com/docs/classic/api/)
- [Express Checkout Integration Guide](https://developer.paypal.com/docs/classic/express-checkout/integration-guide/ECGettingStarted/)
- [NVP API Reference](https://developer.paypal.com/docs/classic/api/nvpsoap-sdks/)

## 🆘 Still Having Issues?

1. **Verify Credentials**: Make sure you're using NVP credentials, not v2 API credentials
2. **Check Sandbox Mode**: Ensure you're in Sandbox mode in PayPal Developer Dashboard
3. **Review Server Logs**: Look for specific error messages
4. **Test with Simple Amounts**: Try small amounts like "1.00" first
5. **Check Network Tab**: Look for failed API calls in browser dev tools

---

**Need Help?** Create an issue in the repository with your error message and we'll help you troubleshoot!
