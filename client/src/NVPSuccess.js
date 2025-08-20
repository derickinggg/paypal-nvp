import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import './NVPSuccess.css';

const NVPSuccess = () => {
  const [searchParams] = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Finalizing your payment...');

  useEffect(() => {
    const transactionId = searchParams.get('transactionId');
    const amount = searchParams.get('amount');
    const currency = searchParams.get('currency');
    const token = searchParams.get('token');
    const payerId = searchParams.get('PayerID');

    if (transactionId && amount && currency) {
      setPaymentDetails({ transactionId, amount, currency });
      setStatus('completed');
      setMessage('Payment captured successfully');
      return;
    }

    // If token and payer present, attempt to complete via API
    if (token && payerId) {
      // We cannot know credentials on this page; user must re-enter if not in session
      const creds = JSON.parse(sessionStorage.getItem('nvpCreds') || '{}');
      if (!creds.paypalUser || !creds.paypalPwd || !creds.paypalSignature) {
        setStatus('needs-creds');
        setMessage('Reopen checkout and provide credentials to capture payment.');
        return;
      }

      const complete = async () => {
        try {
          const rsp = await fetch('/api/nvp/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token,
              payerId,
              paypalUser: creds.paypalUser,
              paypalPwd: creds.paypalPwd,
              paypalSignature: creds.paypalSignature,
            }),
          });
          const data = await rsp.json();
          if (data.success) {
            setPaymentDetails({ transactionId: data.transactionId, amount: data.amount, currency: data.currency });
            setStatus('completed');
            setMessage('Payment captured successfully');
          } else {
            setStatus('error');
            setMessage(data.error || 'Failed to capture payment');
          }
        } catch (err) {
          setStatus('error');
          setMessage('Network error while capturing payment');
        }
      };

      complete();
      return;
    }

    setStatus('unknown');
    setMessage('Missing payment information');
  }, [searchParams]);

  return (
    <div className="nvp-success">
      <div className="success-container">
        {status === 'processing' && <div className="loading">{message}</div>}
        {status === 'needs-creds' && (
          <>
            <div className="loading">{message}</div>
            <p>Please go back to the checkout page and run again.</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="error">{message}</div>
            <button className="btn-secondary" onClick={() => (window.location.href = '/nvp-checkout')}>Try Again</button>
          </>
        )}
        {status === 'completed' && paymentDetails && (
          <>
            <div className="success-icon">✅</div>
            <h1>Payment Successful!</h1>
            <p className="success-message">Your PayPal Express Checkout payment has been completed successfully.</p>
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
            <div className="actions">
              <button className="btn-primary" onClick={() => (window.location.href = '/')}>Return to Home</button>
              <button className="btn-secondary" onClick={() => (window.location.href = '/nvp-checkout')}>Make Another Payment</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NVPSuccess;
