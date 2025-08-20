const paypalNVP = require('../../server/paypal-nvp');

module.exports = async (req, res) => {
  // Enable CORS
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
    const config = paypalNVP.getConfig();
    res.json({
      message: 'PayPal NVP Configuration Status',
      config,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting NVP debug info:', error);
    res.status(500).json({
      error: 'Failed to get debug information',
      details: error.message
    });
  }
};
