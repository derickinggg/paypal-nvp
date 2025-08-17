# Card Payment Checkout App

A modern web application for secure credit card payment processing with a professional checkout interface. Now includes **PayPal NVP Express Checkout** integration alongside the existing PayPal v2 API.

## 🚀 Features

- **Professional Checkout Form**: Clean, modern checkout interface with billing and payment sections
- **Card Number Formatting**: Automatic formatting of card numbers for better UX
- **Form Validation**: Real-time validation with required field indicators
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Order Summary**: Clear display of order total and payment amount
- **Secure Processing**: Server-side payment processing with error handling
- **Dual PayPal Integration**: 
  - PayPal v2 API (modern REST API)
  - PayPal NVP Express Checkout (Classic NVP APIs)

## 🛠️ Tech Stack

- **Frontend**: React 18 with modern hooks and state management
- **Backend**: Node.js + Express with RESTful API
- **Payment Processing**: 
  - PayPal v2 API for order creation and capture
  - PayPal NVP API for Express Checkout integration
- **Styling**: Modern CSS3 with responsive design and animations

## 📋 Prerequisites

Before running this application, you need:

1. **PayPal Developer Account**: Sign up at [developer.paypal.com](https://developer.paypal.com)
2. **PayPal Sandbox Credentials**: 
   - **For v2 API**: Client ID and Secret from the PayPal Developer Dashboard
   - **For NVP API**: Username, Password, and Signature from "API access → NVP/SOAP (Classic) → Manage API Credentials"
3. **Node.js**: Version 14 or higher
4. **npm**: Latest version

## 🔧 Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install

# Return to root
cd ..
```

### 2. Configure PayPal Credentials

1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` and add your PayPal credentials:

   **For PayPal v2 API (existing integration):**
   ```
   PAYPAL_CLIENT_ID=your_sandbox_client_id_here
   PAYPAL_SECRET=your_sandbox_secret_here
   ```

   **For PayPal NVP API (new Express Checkout):**
   ```
   PAYPAL_ENV=sandbox
   PAYPAL_NVP_VERSION=204.0
   PAYPAL_USER=your_api_username
   PAYPAL_PWD=your_api_password
   PAYPAL_SIGNATURE=your_api_signature
   BASE_URL=http://localhost:5000
   ```

3. Update the client ID in `client/src/PayPalCheckout.js`:
   ```javascript
   script.src = `https://www.paypal.com/sdk/js?client-id=YOUR_ACTUAL_CLIENT_ID&components=buttons,hosted-fields&vault=false`;
   ```

### 3. Get PayPal Credentials

#### PayPal v2 API (REST)
1. Go to [developer.paypal.com](https://developer.paypal.com)
2. Log in to your developer account
3. Navigate to "Apps & Credentials"
4. Create a new app or use an existing one
5. Copy the Client ID and Secret (make sure you're in Sandbox mode)

#### PayPal NVP API (Classic)
1. Go to [developer.paypal.com](https://developer.paypal.com)
2. Log in to your developer account
3. Navigate to "API access → NVP/SOAP (Classic) → Manage API Credentials"
4. Copy your Username, Password, and Signature
5. Make sure you're in Sandbox mode for testing

### 4. Run the Application

#### Option 1: Run Both Frontend and Backend Together
```bash
npm start
```

#### Option 2: Run Separately
```bash
# Terminal 1 - Start the backend server
npm run server

# Terminal 2 - Start the React frontend
npm run client
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

## 🧪 Testing

### Test Credit Cards (Sandbox)

Use these test cards for testing:

- **Visa**: 4111111111111111
- **Mastercard**: 5555555555554444
- **American Express**: 378282246310005

**CVV**: Any 3 digits (e.g., 123)
**Expiration**: Any future date (e.g., 12/25)

### Test Scenarios

1. **Successful Payment**: Use any valid test card
2. **Declined Payment**: Use card number 4000000000000002

### PayPal NVP Express Checkout Testing

1. **Sandbox Accounts**: Use PayPal sandbox buyer accounts for testing
2. **Test Flow**: Complete the Express Checkout flow from start to finish
3. **Error Handling**: Test cancellation and error scenarios

## 📁 Project Structure

```
paypal-advanced-checkout-app/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── App.js         # Main app component with navigation
│   │   ├── CardCheckout.js  # PayPal v2 API integration
│   │   ├── NVPExpressCheckout.js  # PayPal NVP Express Checkout
│   │   ├── NVPSuccess.js   # Success page for NVP
│   │   ├── NVPError.js     # Error page for NVP
│   │   ├── NVPCancelled.js # Cancelled page for NVP
│   │   ├── index.js        # React entry point
│   │   └── index.css       # Styles
│   └── package.json
├── server/                 # Node.js backend
│   ├── index.js           # Express server with both API endpoints
│   ├── paypal.js          # PayPal v2 API integration
│   ├── paypal-nvp.js      # PayPal NVP API integration
│   └── package.json
├── .env                   # Environment variables
├── env.example           # Environment template
├── package.json          # Root package.json
└── README.md
```

## 🔒 Security Features

- **Hosted Fields**: Credit card data never touches your server (v2 API)
- **PCI Compliance**: PayPal handles all PCI requirements
- **Direct Processing**: Streamlined payment processing without additional authentication steps
- **Server-side Validation**: All payment processing happens on the backend
- **NVP Security**: Uses PayPal's secure NVP endpoints with signature authentication

## 🌐 API Endpoints

### Backend Endpoints

#### PayPal v2 API (existing)
- `POST /api/create-order`: Creates a new PayPal order
- `POST /api/capture-order`: Captures payment for an existing order

#### PayPal NVP API (new)
- `POST /api/nvp/create`: Creates Express Checkout session
- `GET /api/nvp/return`: Handles PayPal return and completes payment
- `GET /api/nvp/cancel`: Handles checkout cancellation

### Request/Response Examples

#### Create NVP Express Checkout
```javascript
// Request
POST /api/nvp/create
{
  "amount": "19.99",
  "currency": "USD"
}

// Response
{
  "token": "EC-123456789",
  "redirectUrl": "https://www.sandbox.paypal.com/...",
  "success": true
}
```

#### Complete NVP Payment
```javascript
// PayPal redirects to: /api/nvp/return?token=EC-123456789&PayerID=BUYER123
// Server automatically processes payment and redirects to success page
```

## 🔄 NVP Express Checkout Flow

The NVP integration implements PayPal's Classic Express Checkout flow:

1. **SetExpressCheckout**: Create checkout session and get token
2. **Redirect to PayPal**: Send buyer to PayPal with token
3. **Buyer Approval**: Customer approves payment at PayPal
4. **Return to Site**: PayPal redirects back with token and PayerID
5. **GetExpressCheckoutDetails**: Optional - get buyer details
6. **DoExpressCheckoutPayment**: Complete the payment

**Key Benefits:**
- Uses PayPal's proven Classic NVP APIs
- Supports all PayPal account types
- Handles guest checkout seamlessly
- Maintains backward compatibility

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure the backend is running on port 5000
2. **PayPal Script Loading**: Check your internet connection and PayPal service status
3. **Authentication Errors**: Verify your PayPal credentials are correct
4. **Port Conflicts**: Ensure ports 3000 and 5000 are available
5. **NVP Version Issues**: If you see "Version not supported", try changing `PAYPAL_NVP_VERSION` to `200.0`

### Debug Mode

To run in debug mode:

```bash
# Backend with nodemon
cd server && npm run dev

# Frontend with detailed logging
cd client && npm start
```

### NVP-Specific Issues

1. **Invalid Credentials**: Ensure you're using NVP credentials, not v2 API credentials
2. **Token Expiration**: NVP tokens expire after 3 hours
3. **Sandbox vs Live**: Make sure `PAYPAL_ENV` matches your credentials

## 📚 Additional Resources

- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal NVP API Reference](https://developer.paypal.com/docs/classic/api/)
- [PayPal Hosted Fields Guide](https://developer.paypal.com/docs/checkout/advanced/integrate/)
- [React Documentation](https://reactjs.org/docs/)
- [Express.js Documentation](https://expressjs.com/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Important Notes

- This application uses PayPal's **Sandbox** environment for testing
- Never use real credit card information in sandbox mode
- For production, switch to PayPal's live environment
- Always follow PayPal's security best practices
- Keep your API credentials secure and never commit them to version control
- NVP APIs are legacy but still fully supported by PayPal
- Consider using v2 APIs for new integrations, but NVP remains reliable

## 🆘 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Verify your PayPal credentials (both v2 and NVP)
3. Check the browser console for errors
4. Review the PayPal Developer documentation
5. Create an issue in the repository

---

**Happy Coding! 💳✨** 