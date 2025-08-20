import React, { useEffect, useState } from 'react';
import { getApiUrl } from './config';

const PayPalCheckout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    const loadSdk = async () => {
      try {
        const cfgRes = await fetch(getApiUrl('/paypal/config'));
        const cfg = await cfgRes.json();

        const tokenRes = await fetch(getApiUrl('/generate-client-token'), {
          method: 'POST'
        });
        if (!tokenRes.ok) throw new Error('Unable to generate client token');
        const tokenData = await tokenRes.json();

        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${cfg.clientId}&components=buttons,hosted-fields&intent=capture`;
        script.setAttribute('data-client-token', tokenData.client_token);
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

  const loadPayPal = async () => {
    try {
      const orderRes = await fetch(getApiUrl('/create-order'), { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!orderRes.ok) {
        throw new Error('Failed to create order');
      }
      
      const { id: orderId } = await orderRes.json();

      if (window.paypal?.HostedFields && window.paypal.HostedFields.isEligible()) {
        window.paypal.HostedFields.render({
          createOrder: () => orderId,
          styles: {
            input: { 
              'font-size': '16px',
              'font-family': 'Arial, sans-serif'
            },
            '.invalid': { 
              color: 'red' 
            },
            '.valid': { 
              color: 'green' 
            }
          },
          fields: {
            number: { 
              selector: '#card-number', 
              placeholder: '4111 1111 1111 1111' 
            },
            cvv: { 
              selector: '#cvv', 
              placeholder: '123' 
            },
            expirationDate: { 
              selector: '#expiration-date', 
              placeholder: 'MM/YY' 
            }
          },
          fundingSource: window.paypal.FUNDING.CARD
        }).then(hostedFieldsInstance => {
          document.querySelector('#submit').addEventListener('click', async () => {
            setIsLoading(true);
            setMessage('');
            
            try {
              await hostedFieldsInstance.submit();
              
              const captureRes = await fetch(getApiUrl('/capture-order'), {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ orderID: orderId })
              });
              
              if (!captureRes.ok) {
                throw new Error('Failed to capture payment');
              }
              
              const result = await captureRes.json();
              setMessage(`Payment captured successfully! Status: ${result.status}`);
              setMessageType('success');
            } catch (err) {
              setMessage(`Payment failed: ${err.message}`);
              setMessageType('error');
            } finally {
              setIsLoading(false);
            }
          });
        }).catch(err => {
          setMessage(`Failed to load PayPal fields: ${err.message}`);
          setMessageType('error');
        });
      } else {
        setMessage('Card fields are not eligible on this device/browser.');
        setMessageType('error');
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setMessageType('error');
    }
  };

  return (
    <div className="checkout-form">
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h3>Advanced PayPal Checkout (Hosted Fields)</h3>
        <p>Amount: $25.00</p>
      </div>
      <div className="field-container">
        <label htmlFor="card-number">Card Number</label>
        <div id="card-number"></div>
      </div>
      
      <div className="field-container">
        <label htmlFor="cvv">CVV</label>
        <div id="cvv"></div>
      </div>
      
      <div className="field-container">
        <label htmlFor="expiration-date">Expiration Date</label>
        <div id="expiration-date"></div>
      </div>
      
      <button 
        id="submit" 
        className="submit-button"
        disabled={isLoading}
      >
        {isLoading ? 'Processing...' : 'Pay $25.00'}
      </button>
      
      {message && (
        <div className={messageType}>
          {message}
        </div>
      )}
    </div>
  );
};

export default PayPalCheckout; 