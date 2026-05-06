import React, { useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import ExpandableText from './ExpandableText';

export default function ProductCard({ produto }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(produto);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const handleComprar = () => {
    addToCart(produto);
    navigate('/checkout');
  };

  return (
    <Card className="h-100 shadow-sm">
      {produto.images?.[0] && (
        <Card.Img
          variant="top"
          src={produto.images[0]}
          alt={produto.name}
          style={{ height: '200px', objectFit: 'cover' }}
        />
      )}
      <Card.Body className="d-flex flex-column">
        <Card.Title style={{ fontSize: '1rem' }}>{produto.name}</Card.Title>
        <Card.Text className="text-muted" style={{ fontSize: '0.85rem', flexGrow: 1 }}>
          <ExpandableText text={produto.description} maxLength={80} />
        </Card.Text>
        <div className="mt-auto">
          <p className="fw-bold mb-2" style={{ color: '#333' }}>
            R$ {produto.price?.toFixed(2).replace('.', ',')}
          </p>
          {produto.department && (
            <small className="text-muted d-block mb-2">{produto.department}</small>
          )}
          <div className="d-grid gap-2">
            <Button variant="warning" size="sm" onClick={handleComprar}>
              Comprar
            </Button>
            <Button
              variant={added ? 'success' : 'outline-secondary'}
              size="sm"
              onClick={handleAddToCart}
            >
              {added ? 'Adicionado!' : 'Adicionar ao Carrinho'}
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}
