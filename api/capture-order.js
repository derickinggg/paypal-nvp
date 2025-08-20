const axios = require('axios');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const isLive = (process.env.PAYPAL_ENV || '').toLowerCase() === 'live';
    const base = isLive ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const secret = process.env.PAYPAL_SECRET;
    if (!clientId || !secret) return res.status(500).json({ error: 'Missing PayPal credentials' });

    const tokenRsp = await axios.post(
      `${base}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const accessToken = tokenRsp.data.access_token;
    const { orderID } = req.body || {};
    if (!orderID) return res.status(400).json({ error: 'orderID is required' });

    const captureRsp = await axios.post(
      `${base}/v2/checkout/orders/${orderID}/capture`,
      {},
      { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
    );

    res.json(captureRsp.data);
  } catch (err) {
    console.error('Capture order error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to capture order', details: err.response?.data || err.message });
  }
};


