import React, { useState } from 'react';
import './NVPExpressCheckout.css';

const NVPExpressCheckout = () => {
  const [amount, setAmount] = useState('19.99');
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/nvp/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, currency }),
      });

      const data = await response.json();

      if (data.success && data.redirectUrl) {
        // Redirect to PayPal for Express Checkout
        window.location.href = data.redirectUrl;
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

  return (
    <div className="nvp-checkout">
      <div className="nvp-checkout-container">
        <h2>PayPal Express Checkout (NVP)</h2>
        <p className="nvp-description">
          This uses PayPal's Classic NVP APIs for Express Checkout integration.
        </p>
        
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
          <h3>How it works:</h3>
          <ol>
            <li>Enter amount and currency</li>
            <li>Click "Pay with PayPal Express"</li>
            <li>You'll be redirected to PayPal to complete payment</li>
            <li>After approval, you'll return to our success page</li>
          </ol>
          
          <div className="api-info">
            <strong>API Flow:</strong> SetExpressCheckout → PayPal → GetExpressCheckoutDetails → DoExpressCheckoutPayment
          </div>
        </div>
      </div>
    </div>
  );
};

export default NVPExpressCheckout;
