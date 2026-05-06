import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Button, ListGroup, Badge } from 'react-bootstrap';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import SiteNavbar from './SiteNavbar';
import SiteFooter from './SiteFooter';

const Checkout = () => {
  const { cart, totalPrice, clearCart, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  const handlePayment = async () => {
    if (cart.length === 0) return;
    try {
      const items = cart.map(item => ({
        title: item.name,
        price: item.price,
        quantity: item.quantity,
      }));
      const response = await api.post('/payment', { items });
      clearCart();
      window.location.href = response.data.init_point;
    } catch (error) {
      const msg = error.response?.data?.error || error.message || 'Erro desconhecido';
      console.error('[Checkout] Erro ao processar pagamento:', msg);
      alert(`Erro ao processar o pagamento:\n${msg}`);
    }
  };

  return (
    <div>
      <SiteNavbar />

      <Container className="mt-4" style={{ maxWidth: 600 }}>
        <h2 className="mb-4">Finalizar Compra</h2>

        {cart.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted">Seu carrinho está vazio.</p>
            <Button variant="warning" onClick={() => navigate('/')}>
              Continuar Comprando
            </Button>
          </div>
        ) : (
          <>
            <ListGroup variant="flush" className="mb-4">
              {cart.map(item => (
                <ListGroup.Item key={item._id} className="px-0">
                  <div className="d-flex align-items-center gap-2">
                    {item.images?.[0] && (
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
                      />
                    )}
                    <div className="flex-grow-1">
                      <div className="fw-semibold" style={{ fontSize: '0.95rem' }}>{item.name}</div>
                      <small className="text-muted">
                        R$ {item.price.toFixed(2).replace('.', ',')} cada
                      </small>
                    </div>
                    <div className="d-flex align-items-center gap-1">
                      <Button variant="outline-secondary" size="sm" onClick={() => updateQuantity(item._id, -1)}>−</Button>
                      <Badge bg="secondary" style={{ fontSize: '0.9rem', minWidth: 28 }}>{item.quantity}</Badge>
                      <Button variant="outline-secondary" size="sm" onClick={() => updateQuantity(item._id, 1)}>+</Button>
                    </div>
                    <div className="text-end ms-2" style={{ minWidth: 80 }}>
                      <div className="fw-bold">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</div>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-danger p-0"
                        onClick={() => removeFromCart(item._id)}
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>

            <div className="d-flex justify-content-between align-items-center mb-4 fs-5 fw-bold">
              <span>Total</span>
              <span>R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
            </div>

            <div className="d-grid gap-2">
              <Button variant="warning" size="lg" onClick={handlePayment}>
                Pagar com Mercado Pago
              </Button>
              <Button variant="outline-secondary" onClick={() => navigate('/')}>
                Continuar Comprando
              </Button>
              <Button variant="outline-danger" size="sm" onClick={clearCart}>
                Esvaziar Carrinho
              </Button>
            </div>
          </>
        )}
      </Container>

      <SiteFooter />
    </div>
  );
};

export default Checkout;
