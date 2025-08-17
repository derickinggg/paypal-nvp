import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import './NVPError.css';

const NVPError = () => {
  const [searchParams] = useSearchParams();
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      setErrorMessage(decodeURIComponent(error));
    }
  }, [searchParams]);

  return (
    <div className="nvp-error">
      <div className="error-container">
        <div className="error-icon">❌</div>
        <h1>Payment Failed</h1>
        <p className="error-message">
          Unfortunately, your PayPal Express Checkout payment could not be completed.
        </p>
        
        {errorMessage && (
          <div className="error-details">
            <h3>Error Details</h3>
            <div className="error-text">{errorMessage}</div>
          </div>
        )}

        <div className="troubleshooting">
          <h3>What you can do:</h3>
          <ul>
            <li>Check your PayPal account for any issues</li>
            <li>Verify your payment method is valid</li>
            <li>Try the payment again</li>
            <li>Contact support if the problem persists</li>
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

export default NVPError;
