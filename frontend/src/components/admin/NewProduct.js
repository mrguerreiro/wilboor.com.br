import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';

const DEPARTMENTS = [
  'Automotivos', 'Beleza', 'Bolsas', 'Brinquedos', 'Camping/Pesca',
  'Diversos', 'Eletro/Eletrônicos', 'Esportes/Fitness', 'Ferramentas',
  'Informática', 'Materiais e equipamentos para construção', 'Pet', 'Utilidades Domésticas',
];

const EMPTY_FORM = {
  code: '', name: '', price: '', department: '', stock: '1',
  description: '', image: '', featured: false,
  weight: '', dimLength: '', dimWidth: '', dimHeight: '',
};

export default function NewProduct() {
  const location = useLocation();
  const navigate = useNavigate();
  const editing = location.state?.product;

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name || '',
        price: editing.price || '',
        department: editing.department || '',
        stock: editing.stock ?? '1',
        description: editing.description || '',
        image: editing.images?.[0] || '',
        featured: editing.featured || false,
        weight: editing.weight || '',
        dimLength: editing.dimensions?.length || '',
        dimWidth: editing.dimensions?.width || '',
        dimHeight: editing.dimensions?.height || '',
      });
    }
  }, [editing]);

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(prev => ({ ...prev, [field]: value }));
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');

    const body = {
      code: form.code,
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      department: form.department,
      stock: parseInt(form.stock, 10),
      featured: form.featured,
      images: form.image ? [form.image] : [],
      weight: form.weight ? parseFloat(form.weight) : 0,
      dimensions: {
        length: form.dimLength ? parseFloat(form.dimLength) : 0,
        width: form.dimWidth ? parseFloat(form.dimWidth) : 0,
        height: form.dimHeight ? parseFloat(form.dimHeight) : 0,
      },
    };

    try {
      if (editing) {
        await api.put(`/admin/products/${editing._id}`, body);
        setSuccess('Produto atualizado com sucesso!');
        setTimeout(() => navigate('/admin/painel/produtos'), 1500);
      } else {
        await api.post('/admin/products', body);
        setSuccess('Produto cadastrado com sucesso!');
        setForm(EMPTY_FORM);
      }
    } catch (err) {
      alert('Erro ao salvar produto. Verifique se o servidor está rodando.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setForm(EMPTY_FORM);
    setSuccess('');
  };

  return (
    <>
      <h1 className="page-title">{editing ? 'Editar Produto' : 'Novo Produto'}</h1>

      {success && <div className="alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className="admin-form-card">

        <div className="form-grid-2">
          <div className="form-group">
            <label>Código do Produto</label>
            {editing ? (
              <input
                className="form-control-admin"
                value={editing.code || '—'}
                readOnly
                style={{ background: '#f0f0f0', color: '#555', cursor: 'not-allowed', fontWeight: '700', letterSpacing: '2px' }}
              />
            ) : (
              <input
                className="form-control-admin"
                placeholder="Ex: 001"
                value={form.code}
                onChange={handleChange('code')}
                required
              />
            )}
          </div>
          <div className="form-group">
            <label>Nome do Produto</label>
            <input
              className="form-control-admin"
              value={form.name}
              onChange={handleChange('name')}
              required
            />
          </div>
          <div className="form-group">
            <label>Preço</label>
            <input
              className="form-control-admin"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={handleChange('price')}
              required
            />
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label>Departamento</label>
            <select
              className="form-control-admin"
              value={form.department}
              onChange={handleChange('department')}
              required
            >
              <option value="">Selecione um departamento</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Estoque</label>
            <input
              className="form-control-admin"
              type="number"
              min="0"
              value={form.stock}
              onChange={handleChange('stock')}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Descrição</label>
          <textarea
            className="form-control-admin"
            rows={4}
            value={form.description}
            onChange={handleChange('description')}
            style={{ resize: 'vertical' }}
          />
        </div>

        <div className="form-group">
          <label>URL da Imagem</label>
          <input
            className="form-control-admin"
            placeholder="Ex: ./imagens/rebotermic1kg.jpg"
            value={form.image}
            onChange={handleChange('image')}
          />
        </div>

        <fieldset style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '12px 16px', marginBottom: '12px' }}>
          <legend style={{ fontSize: '14px', fontWeight: '600', color: '#555', padding: '0 6px' }}>
            Dimensões e Peso (para cálculo de frete)
          </legend>
          <div className="form-grid-2">
            <div className="form-group">
              <label>Peso (kg)</label>
              <input
                className="form-control-admin"
                type="number"
                step="0.001"
                min="0"
                placeholder="Ex: 1.500"
                value={form.weight}
                onChange={handleChange('weight')}
              />
            </div>
            <div className="form-group">
              <label>Comprimento (cm)</label>
              <input
                className="form-control-admin"
                type="number"
                step="0.1"
                min="0"
                placeholder="Ex: 30"
                value={form.dimLength}
                onChange={handleChange('dimLength')}
              />
            </div>
          </div>
          <div className="form-grid-2">
            <div className="form-group">
              <label>Largura (cm)</label>
              <input
                className="form-control-admin"
                type="number"
                step="0.1"
                min="0"
                placeholder="Ex: 20"
                value={form.dimWidth}
                onChange={handleChange('dimWidth')}
              />
            </div>
            <div className="form-group">
              <label>Altura (cm)</label>
              <input
                className="form-control-admin"
                type="number"
                step="0.1"
                min="0"
                placeholder="Ex: 10"
                value={form.dimHeight}
                onChange={handleChange('dimHeight')}
              />
            </div>
          </div>
        </fieldset>

        <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            id="featured"
            checked={form.featured}
            onChange={handleChange('featured')}
          />
          <label htmlFor="featured" style={{ marginBottom: 0, cursor: 'pointer' }}>
            Destacar na página inicial
          </label>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
          <button type="submit" className="btn-admin-primary" disabled={loading}>
            {loading ? 'Salvando...' : (editing ? 'Atualizar Produto' : 'Cadastrar Produto')}
          </button>
          <button type="button" className="btn-admin-secondary" onClick={handleClear}>
            Limpar
          </button>
        </div>
      </form>
    </>
  );
}
