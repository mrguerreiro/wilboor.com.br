import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, Navigate, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './admin.css';

export default function AdminLayout() {
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let active = true;
    const token = sessionStorage.getItem('adminToken');

    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminAuth');

    if (!token) {
      setCheckingAuth(false);
      navigate('/admin', { replace: true });
      return () => { active = false; };
    }

    api.get('/admin/auth/validate')
      .then(() => {
        if (active) setAuthorized(true);
      })
      .catch(() => {
        sessionStorage.removeItem('adminToken');
        localStorage.removeItem('adminToken');
    localStorage.removeItem('adminAuth');
        if (active) navigate('/admin', { replace: true });
      })
      .finally(() => {
        if (active) setCheckingAuth(false);
      });

    return () => { active = false; };
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminAuth');
    navigate('/admin', { replace: true });
  };

  if (checkingAuth) {
    return (
      <div className="admin-login-bg">
        <div className="admin-login-card">
          <h1 className="admin-login-title">Verificando acesso...</h1>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="sidebar-header">Menu</div>
        <nav>
          <ul className="sidebar-nav">
            <li>
              <NavLink
                to="/admin/painel"
                end
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                <span>📊</span> Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/painel/produtos"
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                <span>🗂</span> Gerenciar Produtos
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/painel/novo-produto"
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                <span>➕</span> Novo Produto
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/painel/clientes"
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                <span>CL</span> Clientes
              </NavLink>
            </li>
            <li className="sidebar-divider" />
            <li>
              <button onClick={handleLogout}>
                <span>↩</span> Sair
              </button>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
