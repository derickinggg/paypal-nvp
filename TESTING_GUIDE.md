# 🧪 Testing Guide - Avoiding Card Declines

## 🚨 Card Decline Solutions

### 1. Use Simple Checkout (Recommended)
- Switch to "Simple Checkout" option in the app
- This uses PayPal's standard buttons instead of hosted fields
- Much more permissive and less likely to decline cards

### 2. PayPal Sandbox Test Cards
Use these specific test cards that are designed to work:

**✅ Always Working Test Cards:**
- **Visa**: `4111111111111111`
- **Mastercard**: `5555555555554444`
- **American Express**: `378282246310005`
- **Discover**: `6011111111111117`

**❌ Avoid These Cards (Will Decline):**
- `4000000000000002` (Always declines)
- `4000000000009995` (Insufficient funds)
- `4000000000009987` (Card declined)

### 3. Test Card Details
- **CVV**: Any 3 digits (e.g., `123`)
- **Expiration**: Any future date (e.g., `12/25`)
- **Billing Address**: Any valid address

### 4. PayPal Sandbox Accounts
Create test buyer accounts in PayPal Developer Dashboard:
1. Go to [developer.paypal.com](https://developer.paypal.com)
2. Navigate to "Sandbox" → "Accounts"
3. Create a new Personal account
4. Use this account for testing instead of real cards

## 🔧 Configuration Changes Made

### Reduced Security Features:
1. **Removed 3D Secure**: No additional authentication required
2. **Simplified Order Creation**: Added test descriptors and descriptions
3. **Immediate Payment**: Set to require immediate payment processing
4. **No Shipping**: Removed shipping requirements
5. **Test Mode**: Added development-friendly settings

### Two Checkout Options:

#### Option 1: Simple Checkout (Recommended)
- Uses PayPal's standard buttons
- Less security restrictions
- Better for testing
- Works with most test cards

#### Option 2: Advanced Hosted Fields
- More secure but stricter
- May decline cards more often
- Use only if you need the advanced features

## 🎯 Testing Steps

### Step 1: Use Simple Checkout
1. Open the app
2. Click "Simple Checkout (Recommended)"
3. Click the PayPal button
4. Use a PayPal sandbox account or test card

### Step 2: PayPal Sandbox Account (Best Option)
1. Create a sandbox buyer account in PayPal Developer Dashboard
2. Use the email/password from that account
3. This is the most reliable way to test

### Step 3: Test Card Fallback
If you must use cards:
1. Use only the "Always Working" test cards listed above
2. Make sure you're in sandbox mode
3. Use the Simple Checkout option

## 🚫 Common Issues & Solutions

### Issue: "Card Declined"
**Solution**: 
- Switch to Simple Checkout
- Use PayPal sandbox account instead of cards
- Use only the recommended test cards

### Issue: "3D Secure Required"
**Solution**: 
- 3D Secure has been disabled
- Use Simple Checkout for easier processing

### Issue: "Invalid Card Number"
**Solution**:
- Make sure you're using sandbox test cards
- Check that you're in sandbox mode
- Use PayPal sandbox account instead

## 📝 Environment Setup

Make sure your `.env` file has sandbox credentials:
```
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_SECRET=your_sandbox_secret
```

**Important**: Never use live credentials for testing!

## 🎉 Success Indicators

When payment is successful, you should see:
- "Payment successful! Transaction ID: [ID]"
- Green success message
- Transaction appears in PayPal Developer Dashboard

## 🔄 If Still Having Issues

1. **Clear browser cache** and try again
2. **Use incognito/private browsing** mode
3. **Try different browser** (Chrome, Firefox, Safari)
4. **Check PayPal Developer Dashboard** for error details
5. **Use PayPal sandbox account** instead of test cards

---

**💡 Pro Tip**: The Simple Checkout option is specifically designed for easier testing and should resolve most card decline issues! 