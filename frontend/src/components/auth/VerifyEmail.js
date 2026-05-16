import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import SiteNavbar from '../SiteNavbar';
import SiteFooter from '../SiteFooter';
import './auth.css';

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Confirmando seu e-mail...');
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const verify = async () => {
      try {
        const { data } = await api.get(`/auth/verify/${token}`);
        if (data.token && data.user) {
          localStorage.setItem('customerToken', data.token);
          localStorage.setItem('customerUser', JSON.stringify(data.user));
        }
        setStatus('success');
        setMessage(data.message || 'E-mail confirmado com sucesso!');
        setTimeout(() => navigate('/', { replace: true }), 2500);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Não foi possível confirmar seu e-mail.');
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <>
      <SiteNavbar />
      <div className="auth-page">
        <div className="auth-card narrow" style={{ textAlign: 'center' }}>
          <h1 className="auth-title">Confirmação de e-mail</h1>

          {status === 'loading' && <p className="auth-subtitle">{message}</p>}
          {status === 'success' && (
            <>
              <div className="auth-success">{message}</div>
              <p className="auth-subtitle">Você será redirecionado para a página inicial...</p>
              <Link to="/" className="auth-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
                Ir para a Home
              </Link>
            </>
          )}
          {status === 'error' && (
            <>
              <div className="auth-error">{message}</div>
              <Link to="/login" className="auth-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
                Voltar ao Login
              </Link>
            </>
          )}
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
