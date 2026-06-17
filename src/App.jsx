import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import SupplierDashboard from './pages/SupplierDashboard';
import SiteManagerDashboard from './pages/SiteManagerDashboard';
import ReceiptSign from './pages/ReceiptSign';

function App() {
  return (
    <div className="app-container">
      <header className="header">
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>바로인수</h1>
      </header>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/supplier" element={<SupplierDashboard />} />
          <Route path="/site-manager" element={<SiteManagerDashboard />} />
          <Route path="/receipt/:id" element={<ReceiptSign />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
