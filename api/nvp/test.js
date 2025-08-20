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
		const { paypalUser, paypalPwd, paypalSignature } = req.body;

		if (!paypalUser || !paypalPwd || !paypalSignature) {
			return res.status(400).json({
				success: false,
				status: 'ERROR',
				message: 'All PayPal NVP API credentials are required',
			});
		}

		const NVP_ENDPOINT = 'https://api-3t.paypal.com/nvp';
		const NVP_VERSION = '204.0';

		const testParams = {
			METHOD: 'GetBalance',
			VERSION: NVP_VERSION,
			USER: paypalUser,
			PWD: paypalPwd,
			SIGNATURE: paypalSignature,
		};

		const postData = Object.entries(testParams)
			.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
			.join('&');

		console.log('🧪 Testing PayPal NVP credentials...');

		const response = await axios.post(NVP_ENDPOINT, postData, {
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			timeout: 15000,
		});

		const parsed = parseNvp(response.data);
		console.log('📥 PayPal NVP Test Response ACK:', parsed.ACK);

		if ((parsed.ACK || '').toLowerCase().startsWith('success')) {
			return res.json({
				success: true,
				status: 'LIVE',
				message: 'PayPal NVP API credentials are valid and active!',
				details: parsed,
			});
		}

		return res.json({
			success: false,
			status: 'ERROR',
			message: parsed.L_LONGMESSAGE0 || parsed.L_SHORTMESSAGE0 || 'Unexpected response from PayPal',
			details: parsed,
		});
	} catch (error) {
		console.error('Error testing PayPal NVP credentials:', error);

		if (error.response) {
			const parsedErr = parseNvp(error.response.data);
			return res.status(400).json({
				success: false,
				status: 'ERROR',
				message: parsedErr.L_LONGMESSAGE0 || parsedErr.L_SHORTMESSAGE0 || error.message,
				details: parsedErr,
			});
		}

		if (error.code === 'ECONNABORTED') {
			return res.status(408).json({
				success: false,
				status: 'TIMEOUT',
				message: 'Request timed out. PayPal API may be slow or credentials may be invalid.',
			});
		}

		return res.status(500).json({
			success: false,
			status: 'NETWORK_ERROR',
			message: error.message,
		});
	}
};
