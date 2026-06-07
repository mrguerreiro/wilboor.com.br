import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import SiteNavbar from '../SiteNavbar';
import SiteFooter from '../SiteFooter';
import './auth.css';

const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

const onlyDigits = (v) => String(v || '').replace(/\D/g, '');

const formatCep = (v) => {
  const d = onlyDigits(v).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
};

const formatPhone = (v) => {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 10) {
    return d.replace(/(\d{0,2})(\d{0,4})(\d{0,4}).*/, (_, a, b, c) =>
      [a && `(${a}`, a && a.length === 2 ? ') ' : '', b, c && `-${c}`].filter(Boolean).join(''));
  }
  return d.replace(/(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
};

const formatCpf = (v) => {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
};

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromState = { from: location.state?.from, reason: location.state?.reason };
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    phone: '',
    cpf: '',
    address: {
      cep: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: ''
    }
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);

  const setField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const setAddress = (field, value) => setForm(prev => ({
    ...prev,
    address: { ...prev.address, [field]: value }
  }));

  const handleCepBlur = async () => {
    const cep = onlyDigits(form.address.cep);
    if (cep.length !== 8) return;
    setCepLoading(true);
    try {
      const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await r.json();
      if (!data.erro) {
        setForm(prev => ({
          ...prev,
          address: {
            ...prev.address,
            street: data.logradouro || prev.address.street,
            neighborhood: data.bairro || prev.address.neighborhood,
            city: data.localidade || prev.address.city,
            state: data.uf || prev.address.state
          }
        }));
      }
    } catch (_) {
      // silencioso — usuário pode preencher manualmente
    } finally {
      setCepLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.password.length < 6) {
      setError('A senha deve ter ao menos 6 caracteres.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        birthDate: form.birthDate,
        phone: form.phone,
        cpf: form.cpf,
        address: form.address
      };
      const { data } = await api.post('/auth/register', payload);
      setSuccess(data.message || 'Cadastro recebido. Verifique seu e-mail.');
      setTimeout(() => navigate('/login', { replace: true, state: fromState }), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao realizar cadastro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <SiteNavbar />
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">Criar minha conta</h1>
          <p className="auth-subtitle">Cadastre-se para acompanhar seus pedidos e finalizar compras com mais rapidez.</p>

          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-section-title">Dados pessoais</div>

            <div className="form-group">
              <label>Nome completo *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>E-mail *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setField('email', e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Telefone *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setField('phone', formatPhone(e.target.value))}
                  placeholder="(11) 99999-9999"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>CPF *</label>
                <input
                  type="text"
                  value={form.cpf}
                  onChange={(e) => setField('cpf', formatCpf(e.target.value))}
                  placeholder="000.000.000-00"
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Data de nascimento *</label>
                <input
                  type="date"
                  value={form.birthDate}
                  onChange={(e) => setField('birthDate', e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Senha *</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setField('password', e.target.value)}
                  minLength={6}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Confirmar senha *</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setField('confirmPassword', e.target.value)}
                  minLength={6}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="auth-section-title">Endereço</div>

            <div className="form-row">
              <div className="form-group">
                <label>CEP * {cepLoading && <small style={{color:'#888'}}>(buscando...)</small>}</label>
                <input
                  type="text"
                  value={form.address.cep}
                  onChange={(e) => setAddress('cep', formatCep(e.target.value))}
                  onBlur={handleCepBlur}
                  placeholder="00000-000"
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Estado *</label>
                <select
                  value={form.address.state}
                  onChange={(e) => setAddress('state', e.target.value)}
                  required
                  disabled={loading}
                >
                  <option value="">Selecione</option>
                  {UFS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Rua / Logradouro *</label>
              <input
                type="text"
                value={form.address.street}
                onChange={(e) => setAddress('street', e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-row-3">
              <div className="form-group">
                <label>Número *</label>
                <input
                  type="text"
                  value={form.address.number}
                  onChange={(e) => setAddress('number', e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Complemento</label>
                <input
                  type="text"
                  value={form.address.complement}
                  onChange={(e) => setAddress('complement', e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Bairro *</label>
                <input
                  type="text"
                  value={form.address.neighborhood}
                  onChange={(e) => setAddress('neighborhood', e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Cidade *</label>
              <input
                type="text"
                value={form.address.city}
                onChange={(e) => setAddress('city', e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Enviando...' : 'Criar conta'}
            </button>

            <div className="auth-footer">
              Já tem conta?{' '}
              <Link to="/login" state={fromState}>
                Faça login
              </Link>
            </div>
          </form>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
