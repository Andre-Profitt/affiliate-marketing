import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import './scss/style.scss';

// Direct imports to avoid lazy loading issues
import DefaultLayout from './layout/DefaultLayout';
import Dashboard from './views/dashboard/Dashboard';
import Products from './views/products/Products';
import Campaigns from './views/campaigns/Campaigns';
import Analytics from './views/analytics/Analytics';

function App() {
  console.log('App component is rendering');
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DefaultLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
