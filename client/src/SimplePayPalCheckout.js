import React, { useEffect, useState } from 'react';
import { getApiUrl } from './config';

const SimplePayPalCheckout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    const loadSdk = async () => {
      try {
        const cfgRes = await fetch(getApiUrl('/paypal/config'));
        const cfg = await cfgRes.json();
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${cfg.clientId}&currency=USD&intent=capture`;
        script.addEventListener('load', loadPayPal);
        document.body.appendChild(script);
      } catch (e) {
        setMessage(`Failed to initialize PayPal: ${e.message}`);
        setMessageType('error');
      }
    };
    loadSdk();
    return () => {
      const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  const loadPayPal = () => {
    if (window.paypal) {
      window.paypal.Buttons({
        createOrder: async () => {
          try {
            const response = await fetch(getApiUrl('/create-order'), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              }
            });
            
            if (!response.ok) {
              throw new Error('Failed to create order');
            }
            
            const order = await response.json();
            return order.id;
          } catch (error) {
            setMessage(`Error creating order: ${error.message}`);
            setMessageType('error');
            throw error;
          }
        },
        
        onApprove: async (data, actions) => {
          setIsLoading(true);
          setMessage('');
          
          try {
            const response = await fetch(getApiUrl('/capture-order'), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ orderID: data.orderID })
            });
            
            if (!response.ok) {
              throw new Error('Failed to capture payment');
            }
            
            const result = await response.json();
            setMessage(`Payment successful! Transaction ID: ${result.id}`);
            setMessageType('success');
          } catch (error) {
            setMessage(`Payment failed: ${error.message}`);
            setMessageType('error');
          } finally {
            setIsLoading(false);
          }
        },
        
        onError: (err) => {
          setMessage(`PayPal Error: ${err.message}`);
          setMessageType('error');
        }
      }).render('#paypal-button-container');
    }
  };

  return (
    <div className="checkout-form">
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h3>Simple PayPal Checkout</h3>
        <p>Amount: $25.00</p>
      </div>
      
      <div id="paypal-button-container" style={{ marginBottom: '20px' }}></div>
      
      {isLoading && (
        <div style={{ textAlign: 'center', color: '#0070ba' }}>
          Processing payment...
        </div>
      )}
      
      {message && (
        <div className={messageType} style={{ textAlign: 'center', marginTop: '10px' }}>
          {message}
        </div>
      )}
    </div>
  );
};

export default SimplePayPalCheckout; 