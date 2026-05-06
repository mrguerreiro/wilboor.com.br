import React from 'react';
import { Offcanvas, Button, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartDrawer({ show, onHide }) {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onHide();
    navigate('/checkout');
  };

  return (
    <Offcanvas show={show} onHide={onHide} placement="end">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Carrinho</Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body>
        {cart.length === 0 ? (
          <p className="text-muted text-center mt-4">Seu carrinho está vazio.</p>
        ) : (
          <>
            <ListGroup variant="flush" className="mb-3">
              {cart.map(item => (
                <ListGroup.Item key={item._id} className="px-0">
                  <div className="d-flex align-items-center gap-2">
                    {item.images?.[0] && (
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }}
                      />
                    )}
                    <div className="flex-grow-1">
                      <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{item.name}</div>
                      <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                        R$ {item.price.toFixed(2).replace('.', ',')}
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-1">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => updateQuantity(item._id, -1)}
                      >-</Button>
                      <span style={{ minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => updateQuantity(item._id, 1)}
                      >+</Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeFromCart(item._id)}
                      >×</Button>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>

            <div className="d-flex justify-content-between fw-bold mb-3 fs-6">
              <span>Total</span>
              <span>R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
            </div>

            <div className="d-grid gap-2">
              <Button variant="warning" onClick={handleCheckout}>
                Finalizar Compra
              </Button>
              <Button variant="outline-secondary" size="sm" onClick={clearCart}>
                Limpar Carrinho
              </Button>
            </div>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
}
