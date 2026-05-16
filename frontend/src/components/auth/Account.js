import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const emptyForm = {
  name: '',
  email: '',
  birthDate: '',
  phone: '',
  address: {
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: ''
  }
};

const toDateInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

export default function Account() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const setField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const setAddress = (field, value) => setForm(prev => ({
    ...prev,
    address: { ...prev.address, [field]: value }
  }));

  useEffect(() => {
    api.get('/auth/me')
      .then(({ data }) => {
        setForm({
          name: data.name || '',
          email: data.email || '',
          birthDate: toDateInput(data.birthDate),
          phone: data.phone || '',
          address: {
            cep: data.address?.cep || '',
            street: data.address?.street || '',
            number: data.address?.number || '',
            complement: data.address?.complement || '',
            neighborhood: data.address?.neighborhood || '',
            city: data.address?.city || '',
            state: data.address?.state || ''
          }
        });
      })
      .catch(() => {
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customerUser');
        navigate('/login', { replace: true, state: { from: '/minha-conta' } });
      })
      .finally(() => setLoading(false));
  }, [navigate]);

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
    setSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        birthDate: form.birthDate,
        phone: form.phone,
        address: form.address
      };
      const { data } = await api.put('/auth/me', payload);
      localStorage.setItem('customerUser', JSON.stringify(data.user));
      setSuccess(data.message || 'Dados atualizados com sucesso.');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao atualizar cadastro.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SiteNavbar />
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">Minha conta</h1>
          <p className="auth-subtitle">Consulte e atualize seus dados cadastrais.</p>

          {loading && <div className="auth-warning">Carregando seus dados...</div>}
          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          {!loading && (
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-section-title">Dados pessoais</div>

              <div className="form-group">
                <label>Nome completo *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  required
                  disabled={saving}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>E-mail</label>
                  <input type="email" value={form.email} disabled />
                </div>
                <div className="form-group">
                  <label>Telefone *</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setField('phone', formatPhone(e.target.value))}
                    placeholder="(11) 99999-9999"
                    required
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Data de nascimento *</label>
                <input
                  type="date"
                  value={form.birthDate}
                  onChange={(e) => setField('birthDate', e.target.value)}
                  required
                  disabled={saving}
                />
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
                    disabled={saving}
                  />
                </div>
                <div className="form-group">
                  <label>Estado *</label>
                  <select
                    value={form.address.state}
                    onChange={(e) => setAddress('state', e.target.value)}
                    required
                    disabled={saving}
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
                  disabled={saving}
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
                    disabled={saving}
                  />
                </div>
                <div className="form-group">
                  <label>Complemento</label>
                  <input
                    type="text"
                    value={form.address.complement}
                    onChange={(e) => setAddress('complement', e.target.value)}
                    disabled={saving}
                  />
                </div>
                <div className="form-group">
                  <label>Bairro *</label>
                  <input
                    type="text"
                    value={form.address.neighborhood}
                    onChange={(e) => setAddress('neighborhood', e.target.value)}
                    required
                    disabled={saving}
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
                  disabled={saving}
                />
              </div>

              <button type="submit" className="auth-btn" disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </form>
          )}
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
