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
import Customers from './components/admin/Customers';
import PoliticaPrivacidade from './components/pages/PoliticaPrivacidade';
import TermosDeUso from './components/pages/TermosDeUso';
import QuemSomos from './components/pages/QuemSomos';
import TrocaseDevolucoes from './components/pages/TrocaseDevolucoes';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import VerifyEmail from './components/auth/VerifyEmail';
import Account from './components/auth/Account';
import RequireCustomerAuth from './components/auth/RequireCustomerAuth';

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainSite />} />
          <Route path="/departamento/:slug" element={<DepartmentPage />} />
          <Route
            path="/checkout"
            element={
              <RequireCustomerAuth>
                <Checkout />
              </RequireCustomerAuth>
            }
          />
          <Route path="/politica-de-privacidade" element={<PoliticaPrivacidade />} />
          <Route path="/termos-de-uso" element={<TermosDeUso />} />
          <Route path="/quem-somos" element={<QuemSomos />} />
          <Route path="/trocas-e-devolucoes" element={<TrocaseDevolucoes />} />
          <Route path="/cadastro" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/minha-conta" element={<RequireCustomerAuth><Account /></RequireCustomerAuth>} />
          <Route path="/verificar-email/:token" element={<VerifyEmail />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/painel" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="produtos" element={<ManageProducts />} />
            <Route path="novo-produto" element={<NewProduct />} />
            <Route path="clientes" element={<Customers />} />
          </Route>
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
