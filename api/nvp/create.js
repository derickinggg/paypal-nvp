const axios = require('axios');

function parseNvp(body) {
	const out = {};
	String(body || '')
		.split('&')
		.forEach(kv => {
			const [k, v] = kv.split('=');
			if (!k) return;
			out[decodeURIComponent(k)] = decodeURIComponent(v || '');
		});
	return out;
}

module.exports = async (req, res) => {
	// Enable CORS
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
		const { amount, currency = 'USD', paypalUser, paypalPwd, paypalSignature } = req.body;
		
		if (!amount || isNaN(parseFloat(amount))) {
			return res.status(400).json({ error: 'Valid amount is required' });
		}

		// Validate credentials
		if (!paypalUser || !paypalPwd || !paypalSignature) {
			return res.status(400).json({ error: 'PayPal NVP credentials are required' });
		}

		// PayPal NVP API configuration
		// Use LIVE by default because provided creds are expected to be live; change to sandbox by adjusting ENDPOINT/HOST
		const NVP_ENDPOINT = 'https://api-3t.paypal.com/nvp';
		const NVP_VERSION = '204.0';
		const PP_HOST = 'www.paypal.com';

		// Get the base URL from the request
		const baseUrl = req.headers.origin || `https://${req.headers.host}`;
		const returnUrl = `${baseUrl}/api/nvp/return`;
		const cancelUrl = `${baseUrl}/api/nvp/cancel`;

		// Create the NVP request
		const nvpParams = {
			METHOD: 'SetExpressCheckout',
			VERSION: NVP_VERSION,
			USER: paypalUser,
			PWD: paypalPwd,
			SIGNATURE: paypalSignature,
			RETURNURL: `${req.headers.origin}/api/nvp/return?paypalUser=${encodeURIComponent(paypalUser)}&paypalPwd=${encodeURIComponent(paypalPwd)}&paypalSignature=${encodeURIComponent(paypalSignature)}`,
			CANCELURL: `${req.headers.origin}/api/nvp/cancel`,
			PAYMENTREQUEST_0_AMT: amount,
			PAYMENTREQUEST_0_CURRENCYCODE: currency,
			PAYMENTREQUEST_0_PAYMENTACTION: 'Sale',
			L_PAYMENTREQUEST_0_NAME0: 'Express Checkout Payment',
			L_PAYMENTREQUEST_0_DESC0: `Payment for ${amount} ${currency}`,
			L_PAYMENTREQUEST_0_AMT0: amount,
			L_PAYMENTREQUEST_0_QTY0: '1',
		};

		// Convert to URL encoded string
		const postData = Object.entries(nvpParams)
			.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
			.join('&');

		console.log('💳 Creating Express Checkout with custom credentials:', amount, currency);
		console.log('📤 PayPal NVP Request: SetExpressCheckout');
		console.log('🔑 Using credentials: USER=' + paypalUser + ', VERSION=' + NVP_VERSION);
		console.log('🌐 Return URL:', returnUrl);
		console.log('🌐 Cancel URL:', cancelUrl);

		// Make the request to PayPal
		const response = await axios.post(NVP_ENDPOINT, postData, {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			timeout: 20000,
		});

		// Parse response
		const parsed = {};
		response.data.split('&').forEach(kv => {
			const [k, v] = kv.split('=');
			parsed[decodeURIComponent(k)] = decodeURIComponent(v || '');
		});

		if (parsed.ACK === 'Success' && parsed.TOKEN) {
			const redirectUrl = `https://${PP_HOST}/cgi-bin/webscr?cmd=_express-checkout&token=${parsed.TOKEN}`;
			return res.json({ success: true, token: parsed.TOKEN, redirectUrl, correlationId: parsed.CORRELATIONID });
		}

		console.error('❌ PayPal SetExpressCheckout failed:', parsed);
		return res.status(400).json({
			error: 'PayPal SetExpressCheckout failed',
			details: parsed.L_LONGMESSAGE0 || 'Unknown error',
			paypalError: parsed
		});
	} catch (error) {
		console.error('Error creating NVP Express Checkout:', error);
		return res.status(500).json({ error: 'Failed to create Express Checkout session', details: error.message });
	}
};
