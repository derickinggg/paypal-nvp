import React from 'react';
import './NVPCancelled.css';

const NVPCancelled = () => {
  return (
    <div className="nvp-cancelled">
      <div className="cancelled-container">
        <div className="cancelled-icon">🚫</div>
        <h1>Checkout Cancelled</h1>
        <p className="cancelled-message">
          You have cancelled the PayPal Express Checkout process. No payment was made.
        </p>
        
        <div className="cancelled-info">
          <h3>What happened?</h3>
          <ul>
            <li>You cancelled the payment before it was completed</li>
            <li>No charges were made to your account</li>
            <li>Your PayPal account remains unchanged</li>
            <li>You can try the payment again anytime</li>
          </ul>
        </div>

        <div className="actions">
          <button 
            className="btn-primary"
            onClick={() => window.location.href = '/nvp-checkout'}
          >
            Try Again
          </button>
          <button 
            className="btn-secondary"
            onClick={() => window.location.href = '/'}
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default NVPCancelled;
