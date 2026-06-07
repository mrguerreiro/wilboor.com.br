import React, { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

const formatCpf = (v) => {
  const d = String(v || '').replace(/\D/g, '');
  if (d.length !== 11) return v || 'Não informado';
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
};

const formatDate = (value) => {
  if (!value) return 'Não informado';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Não informado';
  return date.toLocaleDateString('pt-BR');
};

const formatDateTime = (value) => {
  if (!value) return 'Não informado';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Não informado';
  return date.toLocaleString('pt-BR');
};

const fullAddress = (address = {}) => {
  const line1 = [address.street, address.number].filter(Boolean).join(', ');
  const line2 = [address.complement, address.neighborhood].filter(Boolean).join(' - ');
  const line3 = [address.city, address.state].filter(Boolean).join('/');
  return [line1, line2, line3, address.cep ? `CEP: ${address.cep}` : '']
    .filter(Boolean)
    .join(' | ') || 'Não informado';
};

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const fetchCustomers = useCallback(async (term = '') => {
    setLoading(true);
    setError('');

    try {
      const res = await api.get('/admin/customers', {
        params: term ? { q: term } : {}
      });
      setCustomers(res.data);
    } catch (e) {
      console.error('Erro ao consultar clientes:', e);
      setError(e.response?.data?.message || 'Erro ao consultar clientes cadastrados.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const summary = useMemo(() => {
    const verified = customers.filter(customer => customer.isEmailVerified).length;
    return {
      total: customers.length,
      verified,
      pending: customers.length - verified
    };
  }, [customers]);

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchCustomers(search);
  };

  const handleClear = () => {
    setSearch('');
    fetchCustomers();
  };

  const handleDelete = async (customer) => {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir permanentemente o cadastro de ${customer.name}?`
    );
    if (!confirmed) return;

    try {
      await api.delete(`/admin/customers/${customer._id}`);
      setCustomers(prev => prev.filter(item => item._id !== customer._id));
      if (selectedCustomer?._id === customer._id) {
        setSelectedCustomer(null);
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Erro ao excluir cadastro do cliente.');
    }
  };

  return (
    <>
      <h1 className="page-title">Clientes Cadastrados</h1>

      <div className="stats-grid customers-stats-grid">
        <div className="stat-card">
          <h3>Total de Clientes</h3>
          <div className="stat-value">{loading ? '—' : summary.total}</div>
        </div>
        <div className="stat-card">
          <h3>E-mails Verificados</h3>
          <div className="stat-value">{loading ? '—' : summary.verified}</div>
        </div>
        <div className="stat-card">
          <h3>Verificação Pendente</h3>
          <div className="stat-value">{loading ? '—' : summary.pending}</div>
        </div>
      </div>

      <form className="customers-filter" onSubmit={handleSubmit}>
        <input
          className="form-control-admin"
          placeholder="Buscar por nome, e-mail, telefone, cidade ou estado..."
          value={search}
          onChange={event => setSearch(event.target.value)}
        />
        <button className="btn-admin-primary" type="submit" disabled={loading}>
          Consultar
        </button>
        <button className="btn-admin-secondary" type="button" onClick={handleClear} disabled={loading && !search}>
          Limpar
        </button>
      </form>

      {error && <div className="alert-error">{error}</div>}
      {loading && <p style={{ color: '#999' }}>Carregando clientes...</p>}

      {!loading && customers.length === 0 && (
        <div className="empty-state">Nenhum cliente cadastrado encontrado.</div>
      )}

      {!loading && customers.length > 0 && (
        <div className="customers-table-card">
          <table className="customers-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Contato</th>
                <th>Cidade/UF</th>
                <th>Status</th>
                <th>Cadastro</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer._id}>
                  <td>
                    <strong>{customer.name}</strong>
                    <span>{customer.email}</span>
                  </td>
                  <td>{customer.phone || 'Não informado'}</td>
                  <td>{[customer.address?.city, customer.address?.state].filter(Boolean).join('/') || 'Não informado'}</td>
                  <td>
                    <span className={customer.isEmailVerified ? 'badge-verified' : 'badge-pending'}>
                      {customer.isEmailVerified ? 'Verificado' : 'Pendente'}
                    </span>
                  </td>
                  <td>{formatDate(customer.createdAt)}</td>
                  <td>
                    <div className="customers-actions">
                      <button
                        className="btn-admin-sm-blue customers-detail-button"
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        Ver dados
                      </button>
                      <button
                        className="btn-admin-sm-red customers-detail-button"
                        onClick={() => handleDelete(customer)}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedCustomer && (
        <div className="customer-detail-panel">
          <div className="customer-detail-card">
            <div className="customer-detail-header">
              <div>
                <h2>{selectedCustomer.name}</h2>
                <p>{selectedCustomer.email}</p>
              </div>
              <button type="button" onClick={() => setSelectedCustomer(null)}>Fechar</button>
            </div>

            <div className="customer-detail-grid">
              <div>
                <span>Telefone</span>
                <strong>{selectedCustomer.phone || 'Não informado'}</strong>
              </div>
              <div>
                <span>CPF</span>
                <strong>{formatCpf(selectedCustomer.cpf)}</strong>
              </div>
              <div>
                <span>Data de nascimento</span>
                <strong>{formatDate(selectedCustomer.birthDate)}</strong>
              </div>
              <div>
                <span>Status do e-mail</span>
                <strong>{selectedCustomer.isEmailVerified ? 'Verificado' : 'Pendente'}</strong>
              </div>
              <div>
                <span>Cadastrado em</span>
                <strong>{formatDateTime(selectedCustomer.createdAt)}</strong>
              </div>
              <div className="customer-detail-full">
                <span>Endereço</span>
                <strong>{fullAddress(selectedCustomer.address)}</strong>
              </div>
              <div className="customer-detail-full customer-detail-actions">
                <button
                  type="button"
                  className="btn-admin-sm-red"
                  onClick={() => handleDelete(selectedCustomer)}
                >
                  Excluir cadastro deste cliente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
