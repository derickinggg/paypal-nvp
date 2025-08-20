import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import NVPExpressCheckout from './NVPExpressCheckout';
import NVPError from './NVPError';
import NVPSuccess from './NVPSuccess';
import NVPCancelled from './NVPCancelled';
import PayPalCheckout from './PayPalCheckout';
import SimplePayPalCheckout from './SimplePayPalCheckout';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <header className="App-header">
          <h1>PayPal Checkout Examples</h1>
          <p>Advanced (REST) and Express (NVP) integrations</p>
          <nav className="App-nav" style={{ marginTop: '8px' }}>
            <a href="/nvp-checkout" style={{ marginRight: '12px' }}>Express (NVP)</a>
            <a href="/simple-checkout" style={{ marginRight: '12px' }}>Simple (Buttons)</a>
            <a href="/advanced-checkout">Advanced (Hosted Fields)</a>
          </nav>
        </header>
        
        <main className="App-main">
          <Routes>
            <Route path="/" element={<NVPExpressCheckout />} />
            <Route path="/nvp-checkout" element={<NVPExpressCheckout />} />
            <Route path="/advanced-checkout" element={<PayPalCheckout />} />
            <Route path="/simple-checkout" element={<SimplePayPalCheckout />} />
            <Route path="/nvp-success" element={<NVPSuccess />} />
            <Route path="/nvp-error" element={<NVPError />} />
            <Route path="/nvp-cancelled" element={<NVPCancelled />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        <footer className="App-footer">
          <p>&copy; 2025 PayPal Checkout Demo. REST + NVP.</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App; 