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

async function paypalRequest(method, extra, credentials = null) {
  const creds = credentials || cfg;
  const base = {
    METHOD: method,
    VERSION: creds.version || cfg.version,
    USER: creds.user,
    PWD: creds.pwd,
    SIGNATURE: creds.sig,
  };
  
  const body = encodeNVP({ ...base, ...extra });
  
  console.log(`📤 PayPal NVP Request: ${method}`);
  console.log(`🔑 Using credentials: USER=${creds.user}, VERSION=${creds.version || cfg.version}`);
  
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

  try {
    const result = await paypalRequest('SetExpressCheckout', {
      RETURNURL: returnUrl,
      CANCELURL: cancelUrl,
      PAYMENTREQUEST_0_AMT: amount,
      PAYMENTREQUEST_0_CURRENCYCODE: currency,
      PAYMENTREQUEST_0_PAYMENTACTION: 'Sale',
      L_PAYMENTREQUEST_0_NAME0: 'Express Checkout Payment',
      L_PAYMENTREQUEST_0_DESC0: `Payment for ${amount} ${currency}`,
      L_PAYMENTREQUEST_0_AMT0: amount,
      L_PAYMENTREQUEST_0_QTY0: '1',
    });

    if (result.TOKEN) {
      // Store order details for later retrieval
      orderByToken.set(result.TOKEN, { amount, currency });
      
      // Redirect to PayPal
      const redirectUrl = `https://${PP_HOST}/cgi-bin/webscr?cmd=_express-checkout&token=${result.TOKEN}`;
      
      return {
        success: true,
        token: result.TOKEN,
        redirectUrl,
        correlationId: result.CORRELATIONID
      };
    } else {
      throw new Error('No token received from PayPal');
    }
  } catch (error) {
    console.error('❌ Failed to create Express Checkout:', error);
    throw error;
  }
};

// Create Express Checkout with custom credentials
exports.createWithCredentials = (user, pwd, sig) => {
  const customCredentials = {
    user,
    pwd,
    sig,
    version: cfg.version,
    baseUrl: cfg.baseUrl
  };

  return {
    async createExpressCheckout(amount, currency = 'USD') {
      console.log(`💳 Creating Express Checkout with custom credentials: ${amount} ${currency}`);
      
      const returnUrl = `${customCredentials.baseUrl}/api/nvp/return`;
      const cancelUrl = `${customCredentials.baseUrl}/api/nvp/cancel`;

      try {
        const result = await paypalRequest('SetExpressCheckout', {
          RETURNURL: returnUrl,
          CANCELURL: cancelUrl,
          PAYMENTREQUEST_0_AMT: amount,
          PAYMENTREQUEST_0_CURRENCYCODE: currency,
          PAYMENTREQUEST_0_PAYMENTACTION: 'Sale',
          L_PAYMENTREQUEST_0_NAME0: 'Express Checkout Payment',
          L_PAYMENTREQUEST_0_DESC0: `Payment for ${amount} ${currency}`,
          L_PAYMENTREQUEST_0_AMT0: amount,
          L_PAYMENTREQUEST_0_QTY0: '1',
        }, customCredentials);

        if (result.TOKEN) {
          // Store order details for later retrieval
          orderByToken.set(result.TOKEN, { amount, currency });
          
          // Redirect to PayPal (always use live for custom credentials)
          const redirectUrl = `https://www.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=${result.TOKEN}`;
          
          return {
            success: true,
            token: result.TOKEN,
            redirectUrl,
            correlationId: result.CORRELATIONID
          };
        } else {
          throw new Error('No token received from PayPal');
        }
      } catch (error) {
        console.error('❌ Failed to create Express Checkout with custom credentials:', error);
        throw error;
      }
    }
  };
};

// Get Express Checkout details
exports.getExpressCheckoutDetails = async (token) => {
  console.log(`📋 Getting Express Checkout details for token: ${token}`);
  
  try {
    const result = await paypalRequest('GetExpressCheckoutDetails', {
      TOKEN: token,
    });
    
    return {
      token: result.TOKEN,
      payerId: result.PAYERID,
      email: result.EMAIL,
      firstName: result.FIRSTNAME,
      lastName: result.LASTNAME,
      countryCode: result.COUNTRYCODE,
      amount: result.PAYMENTREQUEST_0_AMT,
      currency: result.PAYMENTREQUEST_0_CURRENCYCODE,
    };
  } catch (error) {
    console.error('❌ Failed to get Express Checkout details:', error);
    throw error;
  }
};

// Complete Express Checkout payment
exports.doExpressCheckoutPayment = async (token, payerId) => {
  console.log(`💳 Completing Express Checkout payment for token: ${token}, payer: ${payerId}`);
  
  const orderDetails = orderByToken.get(token);
  if (!orderDetails) {
    throw new Error('Order details not found for token');
  }
  
  try {
    const result = await paypalRequest('DoExpressCheckoutPayment', {
      TOKEN: token,
      PAYERID: payerId,
      PAYMENTREQUEST_0_PAYMENTACTION: 'Sale',
      PAYMENTREQUEST_0_AMT: orderDetails.amount,
      PAYMENTREQUEST_0_CURRENCYCODE: orderDetails.currency,
    });
    
    // Clean up stored order details
    orderByToken.delete(token);
    
    return {
      success: true,
      transactionId: result.PAYMENTINFO_0_TRANSACTIONID,
      amount: orderDetails.amount,
      currency: orderDetails.currency,
      correlationId: result.CORRELATIONID,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Failed to complete Express Checkout payment:', error);
    throw error;
  }
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

// Get configuration
exports.getConfig = () => ({
  env: cfg.env,
  version: cfg.version,
  endpoint: NVP_ENDPOINT,
  host: PP_HOST,
  hasCredentials: !!(cfg.user && cfg.pwd && cfg.sig),
  baseUrl: cfg.baseUrl
});
