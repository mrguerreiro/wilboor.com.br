import React, { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import './admin.css';

export default function AdminLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('adminAuth') !== 'true') {
      navigate('/admin');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/admin');
  };

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
