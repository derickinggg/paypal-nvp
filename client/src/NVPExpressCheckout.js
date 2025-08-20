import React, { useState } from 'react';
import './NVPExpressCheckout.css';
import { getApiUrl } from './config';

const NVPExpressCheckout = () => {
  const [amount, setAmount] = useState('19.99');
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // NVP API Credentials state
  const [paypalUser, setPaypalUser] = useState('');
  const [paypalPwd, setPaypalPwd] = useState('');
  const [paypalSignature, setPaypalSignature] = useState('');
  
  // API Checker state
  const [checkingCredentials, setCheckingCredentials] = useState(false);
  const [credentialStatus, setCredentialStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate credentials
    if (!paypalUser || !paypalPwd || !paypalSignature) {
      setError('Please enter all PayPal NVP API credentials');
      setLoading(false);
      return;
    }

    // Persist creds for the success page to capture
    sessionStorage.setItem('nvpCreds', JSON.stringify({ paypalUser, paypalPwd, paypalSignature }));

    try {
      const response = await fetch(getApiUrl('/nvp/create'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          amount, 
          currency,
          paypalUser,
          paypalPwd,
          paypalSignature
        }),
      });

      const data = await response.json();

      if (data.success && data.redirectUrl) {
        // Redirect to PayPal for Express Checkout (include creds to auto-capture on return)
        const url = new URL(data.redirectUrl);
        url.searchParams.set('paypalUser', paypalUser);
        url.searchParams.set('paypalPwd', paypalPwd);
        url.searchParams.set('paypalSignature', paypalSignature);
        window.location.href = url.toString();
      } else {
        setError(data.error || 'Failed to create checkout session');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error creating checkout:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkCredentials = async () => {
    if (!paypalUser || !paypalPwd || !paypalSignature) {
      setCredentialStatus({
        success: false,
        status: 'ERROR',
        message: 'Please enter all PayPal NVP API credentials first'
      });
      return;
    }

    setCheckingCredentials(true);
    setCredentialStatus(null);

    try {
      const response = await fetch(getApiUrl('/nvp/test'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paypalUser,
          paypalPwd,
          paypalSignature
        }),
      });

      const data = await response.json();
      setCredentialStatus(data);
    } catch (err) {
      setCredentialStatus({
        success: false,
        status: 'NETWORK_ERROR',
        message: 'Network error while testing credentials',
        error: err.message
      });
    } finally {
      setCheckingCredentials(false);
    }
  };

  return (
    <div className="nvp-checkout">
      <div className="nvp-checkout-container">
        <h2>PayPal Express Checkout (NVP)</h2>
        <p className="nvp-description">
          This uses PayPal's Classic NVP APIs for Express Checkout integration.
        </p>
        
        <div className="nvp-main-content">
          {/* Left Column - Checkout Form */}
          <div className="nvp-checkout-form">
            <h3>Express Checkout</h3>
            <form onSubmit={handleSubmit} className="nvp-form">
              <div className="form-group">
                <label htmlFor="amount">Amount</label>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="19.99"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="currency">Currency</label>
                <select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                </select>
              </div>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                className="paypal-button"
                disabled={loading}
              >
                {loading ? 'Creating Checkout...' : 'Pay with PayPal Express'}
              </button>
            </form>

            <div className="nvp-info">
              <h4>How it works:</h4>
              <ol>
                <li>Enter your PayPal NVP API credentials</li>
                <li>Enter amount and currency</li>
                <li>Click "Pay with PayPal Express"</li>
                <li>You'll be redirected to PayPal to complete payment</li>
                <li>After approval, you'll return to our success page</li>
              </ol>
            </div>
          </div>

          {/* Right Column - NVP Credentials API */}
          <div className="nvp-credentials-api">
            <h3>NVP API Credentials</h3>
            <div className="credentials-info">
              <h4>Enter Your PayPal NVP Credentials</h4>
              <div className="credential-input-group">
                <label htmlFor="paypalUser">PAYPAL_USER:</label>
                <input
                  id="paypalUser"
                  type="text"
                  value={paypalUser}
                  onChange={(e) => setPaypalUser(e.target.value)}
                  placeholder="your_api_username"
                  className="credential-input"
                  required
                />
              </div>
              
              <div className="credential-input-group">
                <label htmlFor="paypalPwd">PAYPAL_PWD:</label>
                <input
                  id="paypalPwd"
                  type="password"
                  value={paypalPwd}
                  onChange={(e) => setPaypalPwd(e.target.value)}
                  placeholder="your_api_password"
                  className="credential-input"
                  required
                />
              </div>
              
              <div className="credential-input-group">
                <label htmlFor="paypalSignature">PAYPAL_SIGNATURE:</label>
                <input
                  id="paypalSignature"
                  type="text"
                  value={paypalSignature}
                  onChange={(e) => setPaypalSignature(e.target.value)}
                  placeholder="your_api_signature"
                  className="credential-input"
                  required
                />
              </div>

              <div className="credentials-note">
                <p><strong>Note:</strong> These credentials are only used for this transaction and are not stored.</p>
                <p>Get your credentials from <a href="https://developer.paypal.com" target="_blank" rel="noopener noreferrer">PayPal Developer Dashboard</a></p>
              </div>

              {/* API Credentials Checker */}
              <div className="api-checker-section">
                <h4>Test Your Credentials</h4>
                <button 
                  onClick={checkCredentials}
                  disabled={checkingCredentials}
                  className="check-credentials-button"
                >
                  {checkingCredentials ? 'Testing...' : '🔍 Test Credentials'}
                </button>
                
                {credentialStatus && (
                  <div className={`credential-status ${credentialStatus.success ? 'success' : 'error'}`}>
                    <div className="status-header">
                      <span className={`status-indicator ${credentialStatus.status.toLowerCase()}`}>
                        {credentialStatus.status === 'LIVE' ? '🟢' : 
                         credentialStatus.status === 'ERROR' ? '🔴' : 
                         credentialStatus.status === 'TIMEOUT' ? '🟡' : '⚪'}
                      </span>
                      <strong>{credentialStatus.status}</strong>
                    </div>
                    <p className="status-message">{credentialStatus.message}</p>
                    {credentialStatus.error && (
                      <p className="status-error">Error: {credentialStatus.error}</p>
                    )}
                    {credentialStatus.details && (
                      <details className="status-details">
                        <summary>View Details</summary>
                        <pre>{JSON.stringify(credentialStatus.details, null, 2)}</pre>
                      </details>
                    )}
                  </div>
                )}
              </div>
              
              <h4>API Configuration</h4>
              <div className="credential-item">
                <label>Environment:</label>
                <span className="credential-value">Live Production</span>
              </div>
              <div className="credential-item">
                <label>API Version:</label>
                <span className="credential-value">204.0</span>
              </div>
              <div className="credential-item">
                <label>Endpoint:</label>
                <span className="credential-value">https://api-3t.paypal.com/nvp</span>
              </div>
              
              <h4>Integration Status</h4>
              <div className="status-item">
                <label>Server Status:</label>
                <span className="status-value online">🟢 Online</span>
              </div>
              <div className="status-item">
                <label>API Endpoint:</label>
                <span className="status-value online">🟢 /api/nvp/create</span>
              </div>
              <div className="status-item">
                <label>Debug Endpoint:</label>
                <span className="status-value online">🟢 /api/nvp/debug</span>
              </div>

              <h4>Test the API</h4>
              <div className="api-test">
                <p>Test the NVP API directly:</p>
                <code className="api-endpoint">
                  POST /api/nvp/create
                </code>
                <div className="test-example">
                  <strong>Example Request:</strong>
                  <pre>{JSON.stringify({
                    amount: "1.00",
                    currency: "USD",
                    paypalUser: "your_username",
                    paypalPwd: "your_password",
                    paypalSignature: "your_signature"
                  }, null, 2)}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NVPExpressCheckout;
