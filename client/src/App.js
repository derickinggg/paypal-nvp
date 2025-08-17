import React, { useState } from 'react';
import NVPExpressCheckout from './NVPExpressCheckout';
import NVPError from './NVPError';
import NVPSuccess from './NVPSuccess';
import NVPCancelled from './NVPCancelled';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('checkout');

  const renderView = () => {
    switch (currentView) {
      case 'checkout':
        return <NVPExpressCheckout />;
      case 'success':
        return <NVPSuccess />;
      case 'error':
        return <NVPError />;
      case 'cancelled':
        return <NVPCancelled />;
      default:
        return <NVPExpressCheckout />;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>PayPal Express Checkout</h1>
        <p>Professional Payment Processing with PayPal NVP API</p>
      </header>
      
      <main className="App-main">
        {renderView()}
      </main>
      
      <footer className="App-footer">
        <p>&copy; 2025 PayPal Express Checkout. Powered by PayPal NVP API.</p>
      </footer>
    </div>
  );
}

export default App; 