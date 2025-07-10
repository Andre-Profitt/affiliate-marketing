import React, { Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { CSpinner } from '@coreui/react';
import './scss/style.scss';

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'));

// Pages
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'));
const Products = React.lazy(() => import('./views/products/Products'));
const Campaigns = React.lazy(() => import('./views/campaigns/Campaigns'));
const Analytics = React.lazy(() => import('./views/analytics/Analytics'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={
        <div className="pt-3 text-center">
          <CSpinner color="primary" variant="grow" />
        </div>
      }>
        <Routes>
          <Route path="/" element={<DefaultLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="campaigns" element={<Campaigns />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
