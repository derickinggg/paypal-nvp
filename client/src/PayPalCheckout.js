import React, { useEffect, useState } from 'react';

const PayPalCheckout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&components=buttons,hosted-fields&vault=false`;
    script.addEventListener("load", loadPayPal);
    document.body.appendChild(script);

    return () => {
      // Cleanup script when component unmounts
      const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  const loadPayPal = async () => {
    try {
      const orderRes = await fetch('/api/create-order', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!orderRes.ok) {
        throw new Error('Failed to create order');
      }
      
      const { id: orderId } = await orderRes.json();

      if (window.paypal.HostedFields) {
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
          fundingSource: paypal.FUNDING.CARD
        }).then(hostedFieldsInstance => {
          document.querySelector('#submit').addEventListener('click', async () => {
            setIsLoading(true);
            setMessage('');
            
            try {
              await hostedFieldsInstance.submit();
              
              const captureRes = await fetch('/api/capture-order', {
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
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setMessageType('error');
    }
  };

  return (
    <div className="checkout-form">
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