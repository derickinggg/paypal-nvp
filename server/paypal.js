const axios = require('axios');
const base = "https://api-m.sandbox.paypal.com";

const auth = async () => {
  const { data } = await axios({
    url: `${base}/v1/oauth2/token`,
    method: "post",
    headers: {
      Authorization: `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString("base64")}`,
    },
    data: "grant_type=client_credentials",
  });
  return data.access_token;
};

exports.createOrder = async (amount = "25.00", currency = "USD") => {
  const accessToken = await auth();
  const { data } = await axios({
    url: `${base}/v2/checkout/orders`,
    method: "post",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    data: {
      intent: "CAPTURE",
      purchase_units: [{ 
        amount: { currency_code: currency, value: amount },
        soft_descriptor: "Test Payment",
        description: "Test purchase for development"
      }],
      application_context: {
        return_url: "http://localhost:3000/success",
        cancel_url: "http://localhost:3000/cancel",
        brand_name: "Test Store",
        shipping_preference: "NO_SHIPPING",
        user_action: "CONTINUE",
        payment_method: {
          payer_selected: "PAYPAL",
          payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED"
        }
      }
    },
  });
  return data;
};

exports.captureOrder = async (orderId) => {
  const accessToken = await auth();
  const { data } = await axios({
    url: `${base}/v2/checkout/orders/${orderId}/capture`,
    method: "post",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation"
    },
  });
  return data;
}; 