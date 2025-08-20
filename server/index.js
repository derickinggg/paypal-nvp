const express = require('express');
const cors = require('cors');
require('dotenv').config();
const axios = require('axios');
const paypalNVP = require('./paypal-nvp');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the React app
app.use(express.static('client/build'));

// NVP Express Checkout endpoints
app.post('/api/nvp/create', async (req, res) => {
  try {
    const { amount, currency = 'USD', paypalUser, paypalPwd, paypalSignature } = req.body;
    
    if (!amount || isNaN(parseFloat(amount))) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    // Validate credentials
    if (!paypalUser || !paypalPwd || !paypalSignature) {
      return res.status(400).json({ error: 'PayPal NVP credentials are required' });
    }

    // Create a temporary NVP instance with user-provided credentials
    const tempNVP = paypalNVP.createWithCredentials(paypalUser, paypalPwd, paypalSignature);
    
    const result = await tempNVP.createExpressCheckout(amount, currency);
    res.json(result);
  } catch (error) {
    console.error('Error creating NVP Express Checkout:', error);
    res.status(500).json({ 
      error: 'Failed to create Express Checkout session',
      details: error.message,
      paypalError: error.data
    });
  }
});

app.get('/api/nvp/return', async (req, res) => {
  const { token, PayerID } = req.query;
  
  if (!token || !PayerID) {
    return res.status(400).json({ error: 'Missing token or PayerID' });
  }

  try {
    // Optional: Get checkout details
    const details = await paypalNVP.getExpressCheckoutDetails(token);
    
    // Complete the payment
    const paymentResult = await paypalNVP.doExpressCheckoutPayment(token, PayerID);
    
    // Redirect to success page with payment details
    const successUrl = `/nvp-success?transactionId=${paymentResult.transactionId}&amount=${paymentResult.amount}&currency=${paymentResult.currency}`;
    res.redirect(successUrl);
  } catch (error) {
    console.error('Error completing NVP payment:', error);
    const errorUrl = `/nvp-error?error=${encodeURIComponent(error.message)}`;
    res.redirect(errorUrl);
  }
});

app.get('/api/nvp/cancel', (req, res) => {
  res.redirect('/nvp-cancelled');
});

// Debug endpoint for NVP configuration
app.get('/api/nvp/debug', (req, res) => {
  const config = paypalNVP.getConfig();
  res.json({
    message: 'PayPal NVP Configuration Status',
    config,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// ==============================
// PayPal Advanced Checkout (REST)
// ==============================

const isLive = (process.env.PAYPAL_ENV || '').toLowerCase() === 'live';
const paypalApiBase = isLive ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

async function getAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET;
  if (!clientId || !secret) {
    throw new Error('Missing PAYPAL_CLIENT_ID or PAYPAL_SECRET');
  }

  const tokenUrl = `${paypalApiBase}/v1/oauth2/token`;
  const auth = Buffer.from(`${clientId}:${secret}`).toString('base64');

  const response = await axios.post(
    tokenUrl,
    'grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );
  return response.data.access_token;
}

// Public config for client (exposes only safe values)
app.get('/api/paypal/config', (req, res) => {
  res.json({
    clientId: process.env.PAYPAL_CLIENT_ID || 'sb',
    environment: isLive ? 'live' : 'sandbox'
  });
});

// Generate client token (required for Hosted Fields)
app.post('/api/generate-client-token', async (req, res) => {
  try {
    const accessToken = await getAccessToken();
    const url = `${paypalApiBase}/v1/identity/generate-token`;
    const response = await axios.post(url, {}, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    res.json({ client_token: response.data.client_token });
  } catch (error) {
    console.error('Error generating client token:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate client token', details: error.response?.data || error.message });
  }
});

// Create order
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount = '25.00', currency = 'USD' } = req.body || {};
    const accessToken = await getAccessToken();
    const url = `${paypalApiBase}/v2/checkout/orders`;
    const response = await axios.post(
      url,
      {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: amount
            }
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    res.json({ id: response.data.id });
  } catch (error) {
    console.error('Error creating order:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to create order', details: error.response?.data || error.message });
  }
});

// Capture order
app.post('/api/capture-order', async (req, res) => {
  try {
    const { orderID } = req.body || {};
    if (!orderID) {
      return res.status(400).json({ error: 'orderID is required' });
    }
    const accessToken = await getAccessToken();
    const url = `${paypalApiBase}/v2/checkout/orders/${orderID}/capture`;
    const response = await axios.post(
      url,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error capturing order:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to capture order', details: error.response?.data || error.message });
  }
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile('client/build/index.html', { root: __dirname + '/..' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend will be available at: http://localhost:${PORT}`);
  console.log(`🔧 API endpoints available at: http://localhost:${PORT}/api`);
  console.log(`💳 NVP Express Checkout available at: http://localhost:${PORT}/api/nvp/create`);
  console.log(`🐛 NVP Debug endpoint: http://localhost:${PORT}/api/nvp/debug`);
  console.log(`🧪 PayPal REST create order: http://localhost:${PORT}/api/create-order`);
  console.log(`🧪 PayPal REST capture order: http://localhost:${PORT}/api/capture-order`);
}); 