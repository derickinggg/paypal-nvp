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
    const resp = await axios.post(
      `${base}/v1/identity/generate-token`,
      {},
      { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
    );

    res.json({ client_token: resp.data.client_token });
  } catch (err) {
    console.error('Generate client token error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to generate client token', details: err.response?.data || err.message });
  }
};


