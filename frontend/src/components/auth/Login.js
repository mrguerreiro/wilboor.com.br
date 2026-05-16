import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import SiteNavbar from '../SiteNavbar';
import SiteFooter from '../SiteFooter';
import './auth.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/';
  const reason = location.state?.reason;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('customerToken')) {
      navigate(redirectTo, { replace: true });
    }
  }, [navigate, redirectTo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setNeedsVerification(false);
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('customerToken', data.token);
      localStorage.setItem('customerUser', JSON.stringify(data.user));
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const data = err.response?.data;
      if (data?.needsVerification) {
        setNeedsVerification(true);
      }
      setError(data?.message || 'Erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setInfo('');
    setResending(true);
    try {
      const { data } = await api.post('/auth/resend-verification', { email });
      setInfo(data.message || 'Se este e-mail estiver cadastrado, enviamos um novo link.');
      setNeedsVerification(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao reenviar e-mail.');
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <SiteNavbar />
      <div className="auth-page">
        <div className="auth-card narrow">
          <h1 className="auth-title">Entrar</h1>
          <p className="auth-subtitle">Acesse sua conta para continuar suas compras.</p>

          {reason === 'checkout' && !error && (
            <div className="auth-warning">
              Para finalizar sua compra, faça login ou crie uma conta.
            </div>
          )}
          {error && <div className="auth-error">{error}</div>}
          {info && <div className="auth-success">{info}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

            {needsVerification && (
              <button
                type="button"
                className="auth-btn-secondary"
                onClick={handleResend}
                disabled={resending || !email}
              >
                {resending ? 'Enviando...' : 'Reenviar e-mail de confirmação'}
              </button>
            )}

            <div className="auth-footer">
              Ainda não tem conta?{' '}
              <Link to="/cadastro" state={{ from: redirectTo, reason }}>
                Cadastre-se
              </Link>
            </div>
          </form>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
