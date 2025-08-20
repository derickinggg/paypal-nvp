const axios = require('axios');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, payerId, paypalUser, paypalPwd, paypalSignature } = req.body;

    if (!token || !payerId) {
      return res.status(400).json({ error: 'Missing token or payerId' });
    }
    if (!paypalUser || !paypalPwd || !paypalSignature) {
      return res.status(400).json({ error: 'PayPal NVP credentials are required' });
    }

    const NVP_ENDPOINT = 'https://api-3t.paypal.com/nvp';
    const NVP_VERSION = '204.0';

    // Helper to POST to NVP
    const postNvp = async (params) => {
      const postData = Object.entries(params)
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join('&');
      const rsp = await axios.post(NVP_ENDPOINT, postData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 20000,
      });
      // Parse NVP response into object
      const data = {};
      rsp.data.split('&').forEach(kv => {
        const [k, v] = kv.split('=');
        data[decodeURIComponent(k)] = decodeURIComponent(v || '');
      });
      return data;
    };

    // 1) Get details to retrieve amount/currency
    const details = await postNvp({
      METHOD: 'GetExpressCheckoutDetails',
      VERSION: NVP_VERSION,
      USER: paypalUser,
      PWD: paypalPwd,
      SIGNATURE: paypalSignature,
      TOKEN: token,
    });

    if ((details.ACK || '').toLowerCase() !== 'success') {
      return res.status(400).json({
        error: 'GetExpressCheckoutDetails failed',
        paypalError: details,
      });
    }

    const amount = details.PAYMENTREQUEST_0_AMT || details.AMT;
    const currency = details.PAYMENTREQUEST_0_CURRENCYCODE || details.CURRENCYCODE || 'USD';

    // 2) Capture the payment
    const capture = await postNvp({
      METHOD: 'DoExpressCheckoutPayment',
      VERSION: NVP_VERSION,
      USER: paypalUser,
      PWD: paypalPwd,
      SIGNATURE: paypalSignature,
      TOKEN: token,
      PAYERID: payerId,
      PAYMENTREQUEST_0_PAYMENTACTION: 'Sale',
      PAYMENTREQUEST_0_AMT: amount,
      PAYMENTREQUEST_0_CURRENCYCODE: currency,
    });

    if ((capture.ACK || '').toLowerCase() !== 'success') {
      return res.status(400).json({
        error: 'DoExpressCheckoutPayment failed',
        paypalError: capture,
      });
    }

    return res.json({
      success: true,
      transactionId: capture.PAYMENTINFO_0_TRANSACTIONID,
      amount,
      currency,
      correlationId: capture.CORRELATIONID,
    });
  } catch (error) {
    console.error('Error completing NVP payment:', error);
    return res.status(500).json({ error: 'Failed to complete payment', details: error.message });
  }
};
