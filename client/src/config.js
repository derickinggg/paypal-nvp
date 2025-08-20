// Configuration for different environments
const config = {
  // Use relative API base URL so it works locally (proxy) and on Vercel
  apiBaseUrl: '/api',
  
  // PayPal NVP endpoints
  nvpEndpoints: {
    create: '/nvp/create',
    return: '/nvp/return',
    cancel: '/nvp/cancel',
    test: '/nvp/test',
    debug: '/nvp/debug'
  },
  
  // PayPal Standard endpoints
  paypalEndpoints: {
    createOrder: '/create-order',
    captureOrder: '/capture-order'
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${config.apiBaseUrl}${endpoint}`;
};

// Helper function to get current environment
export const isProduction = () => {
  return process.env.NODE_ENV === 'production';
};

export default config;
