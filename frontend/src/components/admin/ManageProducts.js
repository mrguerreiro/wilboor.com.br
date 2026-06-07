import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const DEPARTMENTS = [
  'Automotivos', 'Beleza', 'Bolsas', 'Brinquedos', 'Camping/Pesca',
  'Diversos', 'Eletro/Eletrônicos', 'Esportes/Fitness', 'Ferramentas',
  'Informática', 'Materiais e equipamentos para construção', 'Pet', 'Utilidades Domésticas',
];

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nameFilter, setNameFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const navigate = useNavigate();

  const fetchProducts = useCallback(async () => {
    try {
      const res = await api.get('/admin/products');
      setProducts(res.data);
    } catch (e) {
      console.error('Erro ao buscar produtos:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar este produto permanentemente?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch (e) {
      alert('Erro ao deletar produto. Verifique se o servidor está rodando.');
    }
  };

  const handleToggleFeatured = async (product) => {
    const newValue = !product.featured;
    try {
      await api.put(`/admin/products/${product._id}`, { featured: newValue });
      setProducts(prev => prev.map(p => p._id === product._id ? { ...p, featured: newValue } : p));
    } catch (e) {
      alert('Erro ao atualizar destaque do produto.');
    }
  };

  const handleTogglePaused = async (product) => {
    const newValue = !product.paused;
    try {
      await api.put(`/admin/products/${product._id}`, { paused: newValue });
      setProducts(prev => prev.map(p => p._id === product._id ? { ...p, paused: newValue } : p));
    } catch (e) {
      alert('Erro ao pausar/publicar produto.');
    }
  };

  const filtered = products.filter(p => {
    const nameMatch = !nameFilter || p.name?.toLowerCase().includes(nameFilter.toLowerCase());
    const deptMatch = !deptFilter || p.department === deptFilter;
    return nameMatch && deptMatch;
  });

  return (
    <>
      <h1 className="page-title">Gerenciar Produtos</h1>

      <div className="products-filter">
        <input
          className="form-control-admin"
          placeholder="Filtrar por nome..."
          value={nameFilter}
          onChange={e => setNameFilter(e.target.value)}
        />
        <select
          className="form-control-admin"
          value={deptFilter}
          onChange={e => setDeptFilter(e.target.value)}
        >
          <option value="">Todos os departamentos</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {loading && <p style={{ color: '#999' }}>Carregando produtos...</p>}

      {!loading && filtered.length === 0 && (
        <div className="empty-state">Nenhum produto encontrado.</div>
      )}

      <div className="products-grid">
        {filtered.map(product => (
          <div key={product._id} className={`product-card${product.paused ? ' product-card-paused' : ''}`}>
            <div style={{ position: 'relative' }}>
              {product.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="product-card-img"
                  style={product.paused ? { opacity: 0.4 } : undefined}
                />
              ) : (
                <div className="product-card-img-placeholder">Sem imagem</div>
              )}
              {product.paused && (
                <span className="badge-paused">PAUSADO</span>
              )}
            </div>
            <div className="product-card-body">
              {product.code && (
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#888', letterSpacing: '1px', background: '#f0f0f0', borderRadius: '4px', padding: '1px 6px' }}>
                  #{product.code}
                </span>
              )}
              <h3 className="product-card-name">{product.name}</h3>
              <p className="product-card-desc">{product.description}</p>
              <p className="product-card-price">R$ {product.price?.toFixed(2)}</p>
              <p className="product-card-meta">
                {product.department || 'Sem departamento'} | {product.stock ?? 1} em estoque
              </p>
              <div className="product-card-actions">
                <button
                  className="btn-admin-sm-yellow"
                  onClick={() => navigate('/admin/painel/novo-produto', { state: { product } })}
                >
                  ✏️ Editar
                </button>
                <button
                  className="btn-admin-sm-blue"
                  onClick={() => handleToggleFeatured(product)}
                  title={product.featured ? 'Remover do destaque' : 'Destacar produto'}
                >
                  {product.featured ? '★ Remover' : '☆ Destacar'}
                </button>
                <button
                  className={product.paused ? 'btn-admin-sm-green' : 'btn-admin-sm-gray'}
                  onClick={() => handleTogglePaused(product)}
                  title={product.paused ? 'Publicar produto no site' : 'Pausar exibição no site'}
                >
                  {product.paused ? '▶ Publicar' : '⏸ Pausar'}
                </button>
                <button
                  className="btn-admin-sm-red"
                  onClick={() => handleDelete(product._id)}
                >
                  🗑 Deletar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
