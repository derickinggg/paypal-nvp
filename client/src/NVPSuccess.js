import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import './NVPSuccess.css';

const NVPSuccess = () => {
  const [searchParams] = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    const transactionId = searchParams.get('transactionId');
    const amount = searchParams.get('amount');
    const currency = searchParams.get('currency');

    if (transactionId && amount && currency) {
      setPaymentDetails({
        transactionId,
        amount,
        currency
      });
    }
  }, [searchParams]);

  if (!paymentDetails) {
    return (
      <div className="nvp-success">
        <div className="success-container">
          <div className="loading">Loading payment details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="nvp-success">
      <div className="success-container">
        <div className="success-icon">✅</div>
        <h1>Payment Successful!</h1>
        <p className="success-message">
          Your PayPal Express Checkout payment has been completed successfully.
        </p>
        
        <div className="payment-details">
          <h2>Payment Details</h2>
          <div className="detail-row">
            <span className="label">Transaction ID:</span>
            <span className="value">{paymentDetails.transactionId}</span>
          </div>
          <div className="detail-row">
            <span className="label">Amount:</span>
            <span className="value">{paymentDetails.amount} {paymentDetails.currency}</span>
          </div>
          <div className="detail-row">
            <span className="label">Status:</span>
            <span className="value status-success">Completed</span>
          </div>
        </div>

        <div className="next-steps">
          <h3>What happens next?</h3>
          <ul>
            <li>You'll receive a confirmation email from PayPal</li>
            <li>Your payment has been processed and captured</li>
            <li>You can use this transaction ID for any support inquiries</li>
          </ul>
        </div>

        <div className="actions">
          <button 
            className="btn-primary"
            onClick={() => window.location.href = '/'}
          >
            Return to Home
          </button>
          <button 
            className="btn-secondary"
            onClick={() => window.location.href = '/nvp-checkout'}
          >
            Make Another Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default NVPSuccess;
