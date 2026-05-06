import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products')
      .then(res => setProducts(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total = products.length;
  const destaque = products.filter(p => p.featured).length;
  const departamentos = new Set(products.map(p => p.department).filter(Boolean)).size;
  const recentes = [...products].reverse().slice(0, 5);

  return (
    <>
      <h1 className="page-title">Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total de Produtos</h3>
          <div className="stat-value">{loading ? '—' : total}</div>
        </div>
        <div className="stat-card">
          <h3>Produtos em Destaque</h3>
          <div className="stat-value">{loading ? '—' : destaque}</div>
        </div>
        <div className="stat-card">
          <h3>Departamentos</h3>
          <div className="stat-value">{loading ? '—' : departamentos}</div>
        </div>
      </div>

      <h2 className="section-title">Últimos Produtos Cadastrados</h2>
      <div className="recent-products-list">
        {loading && (
          <div className="recent-product-item">
            <span style={{ color: '#999' }}>Carregando...</span>
          </div>
        )}
        {!loading && recentes.length === 0 && (
          <div className="recent-product-item">
            <span style={{ color: '#999' }}>Nenhum produto cadastrado.</span>
          </div>
        )}
        {recentes.map(p => (
          <div key={p._id} className="recent-product-item">
            <div>
              <p className="recent-product-name">{p.name}</p>
              <p className="recent-product-sub">
                {p.department || 'Sem departamento'} — R$ {p.price?.toFixed(2)}
              </p>
            </div>
            <span className={p.featured ? 'badge-destaque' : 'badge-normal'}>
              {p.featured ? 'Em Destaque' : 'Normal'}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
