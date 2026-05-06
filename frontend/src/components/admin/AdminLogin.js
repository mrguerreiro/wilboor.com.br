import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './admin.css';

const ADMIN_PASSWORD = '8751161';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('adminAuth') === 'true') {
      navigate('/admin/painel');
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('adminAuth', 'true');
      navigate('/admin/painel');
    } else {
      setError('Senha incorreta. Tente novamente.');
      setPassword('');
    }
  };

  return (
    <div className="admin-login-bg">
      <div className="admin-login-card">
        <h1 className="admin-login-title">Painel Administrativo</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Senha de Acesso</label>
            <input
              type="password"
              className="form-control-admin"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              autoFocus
            />
          </div>
          {error && <p className="alert-error">{error}</p>}
          <button
            type="submit"
            className="btn-admin-primary"
            style={{ width: '100%', marginBottom: '10px' }}
          >
            Acessar Painel
          </button>
          <button
            type="button"
            className="btn-admin-secondary"
            style={{ width: '100%' }}
            onClick={() => navigate('/')}
          >
            Voltar ao Site
          </button>
        </form>
      </div>
    </div>
  );
}
