import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './admin.css';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.removeItem('adminToken');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminAuth');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/admin/auth/login', { password });
      sessionStorage.setItem('adminToken', data.token);
      navigate('/admin/painel', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao tentar autenticar. Tente novamente.';
      setError(msg);
      setPassword('');
    } finally {
      setLoading(false);
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
              disabled={loading}
            />
          </div>
          {error && <p className="alert-error">{error}</p>}
          <button
            type="submit"
            className="btn-admin-primary"
            style={{ width: '100%', marginBottom: '10px' }}
            disabled={loading}
          >
            {loading ? 'Verificando...' : 'Acessar Painel'}
          </button>
          <button
            type="button"
            className="btn-admin-secondary"
            style={{ width: '100%' }}
            onClick={() => navigate('/')}
            disabled={loading}
          >
            Voltar ao Site
          </button>
        </form>
      </div>
    </div>
  );
}
