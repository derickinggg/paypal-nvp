const express = require('express');
const cors = require('cors');
require('dotenv').config();
const paypal = require('./paypal');
const paypalNVP = require('./paypal-nvp');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the React app
app.use(express.static('client/build'));

// Existing PayPal v2 API endpoints
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount = "25.00", currency = "USD" } = req.body;
    
    // Validate amount
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const order = await paypal.createOrder(amount, currency);
    res.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.post('/api/capture-order', async (req, res) => {
  try {
    const { orderID, billingInfo } = req.body;
    
    // Log billing information for debugging
    if (billingInfo) {
      console.log('Billing Information:', {
        name: `${billingInfo.firstName} ${billingInfo.lastName}`,
        email: billingInfo.email,
        address: billingInfo.address,
        city: billingInfo.city,
        state: billingInfo.state,
        zipCode: billingInfo.zipCode
      });
    }
    
    const capture = await paypal.captureOrder(orderID);
    res.json(capture);
  } catch (error) {
    console.error('Error capturing order:', error);
    res.status(500).json({ error: 'Failed to capture order' });
  }
});

// New NVP Express Checkout endpoints
app.post('/api/nvp/create', async (req, res) => {
  try {
    const { amount, currency = 'USD' } = req.body;
    
    if (!amount || isNaN(parseFloat(amount))) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const result = await paypalNVP.createExpressCheckout(amount, currency);
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
}); 