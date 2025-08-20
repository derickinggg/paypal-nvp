const axios = require('axios');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, PayerID, paypalUser, paypalPwd, paypalSignature } = req.query;

    if (!token || !PayerID) {
      return res.status(400).json({ error: 'Token and PayerID are required' });
    }

    // If credentials passed back in query, auto-capture
    if (paypalUser && paypalPwd && paypalSignature) {
      try {
        const completeRsp = await axios.post(`${req.headers.origin}/api/nvp/complete`, {
          token,
          payerId: PayerID,
          paypalUser,
          paypalPwd,
          paypalSignature,
        }, { headers: { 'Content-Type': 'application/json' } });

        const data = completeRsp.data;
        if (data && data.success) {
          const successUrl = `/nvp-success?transactionId=${encodeURIComponent(data.transactionId)}&amount=${encodeURIComponent(data.amount)}&currency=${encodeURIComponent(data.currency)}`;
          return res.redirect(successUrl);
        }
      } catch (e) {
        // fallthrough to simple redirect with error
      }
    }

    // Fallback: redirect to app with token/payer to let client call complete
    const fallbackUrl = `/nvp-success?token=${encodeURIComponent(token)}&PayerID=${encodeURIComponent(PayerID)}`;
    res.redirect(fallbackUrl);

  } catch (error) {
    console.error('Error handling NVP return:', error);
    res.redirect(`${req.headers.origin}/nvp-error?message=${encodeURIComponent('Failed to process return')}`);
  }
};
