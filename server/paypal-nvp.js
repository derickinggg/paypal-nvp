const axios = require('axios');

// Configuration
const cfg = {
  env: process.env.PAYPAL_ENV || 'sandbox',
  version: process.env.PAYPAL_NVP_VERSION || '204.0',
  user: process.env.PAYPAL_USER,
  pwd: process.env.PAYPAL_PWD,
  sig: process.env.PAYPAL_SIGNATURE,
  baseUrl: process.env.BASE_URL || 'http://localhost:3001',
};

// Validate configuration
if (!cfg.user || !cfg.pwd || !cfg.sig) {
  console.error('❌ PayPal NVP credentials missing! Check your .env file.');
  console.error('Required: PAYPAL_USER, PAYPAL_PWD, PAYPAL_SIGNATURE');
}

// Pick correct NVP endpoint + PayPal web host for redirects
const NVP_ENDPOINT =
  cfg.env === 'live'
    ? 'https://api-3t.paypal.com/nvp'
    : 'https://api-3t.sandbox.paypal.com/nvp';

const PP_HOST = cfg.env === 'live' ? 'www.paypal.com' : 'www.sandbox.paypal.com';

console.log(`🚀 PayPal NVP configured for ${cfg.env} environment`);
console.log(`🔗 NVP Endpoint: ${NVP_ENDPOINT}`);
console.log(`🌐 PayPal Host: ${PP_HOST}`);

// Simple in-memory store to remember the amount/currency per token (demo only!)
const orderByToken = new Map();

function encodeNVP(obj) {
  return Object.entries(obj)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}

function parseNVP(s) {
  const out = {};
  s.split('&').forEach(kv => {
    const [k, v] = kv.split('=');
    out[decodeURIComponent(k)] = decodeURIComponent(v || '');
  });
  return out;
}

async function paypalRequest(method, extra) {
  const base = {
    METHOD: method,
    VERSION: cfg.version,
    USER: cfg.user,
    PWD: cfg.pwd,
    SIGNATURE: cfg.sig,
  };
  
  const body = encodeNVP({ ...base, ...extra });
  
  console.log(`📤 PayPal NVP Request: ${method}`);
  console.log(`🔑 Using credentials: USER=${cfg.user}, VERSION=${cfg.version}`);
  
  try {
    const res = await axios.post(NVP_ENDPOINT, body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 20000,
    });
    
    const data = parseNVP(res.data);
    console.log(`📥 PayPal NVP Response: ${method} - ACK: ${data.ACK}`);
    
    if ((data.ACK || '').toLowerCase().indexOf('success') !== 0) {
      const err = new Error(`PayPal ${method} failed: ${data.L_LONGMESSAGE0 || data.L_SHORTMESSAGE0 || 'Unknown error'}`);
      err.data = data;
      console.error(`❌ PayPal ${method} failed:`, data);
      throw err;
    }
    
    return data;
  } catch (error) {
    console.error(`❌ PayPal ${method} request failed:`, error.message);
    
    if (error.response) {
      const data = parseNVP(error.response.data);
      const err = new Error(`PayPal ${method} failed: ${data.L_LONGMESSAGE0 || data.L_SHORTMESSAGE0 || 'Unknown error'}`);
      err.data = data;
      console.error(`📥 PayPal error response:`, data);
      throw err;
    }
    throw error;
  }
}

// Create Express Checkout session
exports.createExpressCheckout = async (amount, currency = 'USD') => {
  console.log(`💳 Creating Express Checkout: ${amount} ${currency}`);
  
  const returnUrl = `${cfg.baseUrl}/api/nvp/return`;
  const cancelUrl = `${cfg.baseUrl}/api/nvp/cancel`;

  // Minimal required fields for EC
  const params = {
    RETURNURL: returnUrl,
    CANCELURL: cancelUrl,
    PAYMENTREQUEST_0_AMT: amount,
    PAYMENTREQUEST_0_CURRENCYCODE: currency,
    PAYMENTREQUEST_0_PAYMENTACTION: 'Sale',
    // Optional cosmetics:
    BRANDNAME: 'My Store',
    LANDINGPAGE: 'Login',
    SOLUTIONTYPE: 'Sole',
    // Optional: make final button "Pay Now"
    USERACTION: 'commit',
    // Recommend: unique invoice for idempotency/reporting
    PAYMENTREQUEST_0_INVNUM: `INV-${Date.now()}`,
  };

  const rsp = await paypalRequest('SetExpressCheckout', params);
  const token = rsp.TOKEN;
  
  console.log(`✅ Express Checkout created with token: ${token}`);
  
  // Store order details for later retrieval
  orderByToken.set(token, { amount, currency, createdAt: Date.now() });

  const redirectUrl = `https://${PP_HOST}/cgi-bin/webscr?cmd=_express-checkout&token=${encodeURIComponent(token)}&useraction=commit`;
  
  return {
    token,
    redirectUrl,
    success: true
  };
};

// Get Express Checkout details
exports.getExpressCheckoutDetails = async (token) => {
  console.log(`📋 Getting Express Checkout details for token: ${token}`);
  return await paypalRequest('GetExpressCheckoutDetails', { TOKEN: token });
};

// Complete Express Checkout payment
exports.doExpressCheckoutPayment = async (token, payerID) => {
  console.log(`💸 Completing Express Checkout payment for token: ${token}, PayerID: ${payerID}`);
  
  const orderDetails = orderByToken.get(token);
  if (!orderDetails) {
    throw new Error('Order context missing. Token may have expired.');
  }

  const { amount, currency } = orderDetails;

  const payRsp = await paypalRequest('DoExpressCheckoutPayment', {
    TOKEN: token,
    PAYERID: payerID,
    PAYMENTREQUEST_0_AMT: amount,
    PAYMENTREQUEST_0_CURRENCYCODE: currency,
    PAYMENTREQUEST_0_PAYMENTACTION: 'Sale',
    PAYMENTREQUEST_0_INVNUM: `INV-${Date.now()}`,
  });

  console.log(`✅ Payment completed successfully! Transaction ID: ${payRsp.PAYMENTINFO_0_TRANSACTIONID}`);

  // Clean up stored order data
  orderByToken.delete(token);

  return {
    success: true,
    transactionId: payRsp.PAYMENTINFO_0_TRANSACTIONID,
    amount,
    currency,
    payerID,
    response: payRsp
  };
};

// Get stored order details by token
exports.getOrderByToken = (token) => {
  return orderByToken.get(token);
};

// Clean up expired tokens (optional - for production use)
exports.cleanupExpiredTokens = () => {
  const now = Date.now();
  const expiredTokens = [];
  
  for (const [token, orderData] of orderByToken.entries()) {
    // Simple cleanup - in production you might want to store timestamps
    // and clean up based on actual expiration times
    if (orderData.createdAt && (now - orderData.createdAt) > 3600000) { // 1 hour
      expiredTokens.push(token);
    }
  }
  
  expiredTokens.forEach(token => orderByToken.delete(token));
  
  if (expiredTokens.length > 0) {
    console.log(`🧹 Cleaned up ${expiredTokens.length} expired tokens`);
  }
  
  return expiredTokens.length;
};

// Get current configuration (for debugging)
exports.getConfig = () => {
  return {
    env: cfg.env,
    version: cfg.version,
    endpoint: NVP_ENDPOINT,
    host: PP_HOST,
    hasCredentials: !!(cfg.user && cfg.pwd && cfg.sig),
    baseUrl: cfg.baseUrl
  };
};
