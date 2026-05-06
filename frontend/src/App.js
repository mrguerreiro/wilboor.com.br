import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import MainSite from './components/MainSite';
import DepartmentPage from './components/DepartmentPage';
import Checkout from './components/Checkout';
import AdminLogin from './components/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './components/admin/Dashboard';
import ManageProducts from './components/admin/ManageProducts';
import NewProduct from './components/admin/NewProduct';
import PoliticaPrivacidade from './components/pages/PoliticaPrivacidade';
import TermosDeUso from './components/pages/TermosDeUso';
import QuemSomos from './components/pages/QuemSomos';
import TrocaseDevolucoes from './components/pages/TrocaseDevolucoes';

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainSite />} />
          <Route path="/departamento/:slug" element={<DepartmentPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/politica-de-privacidade" element={<PoliticaPrivacidade />} />
          <Route path="/termos-de-uso" element={<TermosDeUso />} />
          <Route path="/quem-somos" element={<QuemSomos />} />
          <Route path="/trocas-e-devolucoes" element={<TrocaseDevolucoes />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/painel" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="produtos" element={<ManageProducts />} />
            <Route path="novo-produto" element={<NewProduct />} />
          </Route>
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
