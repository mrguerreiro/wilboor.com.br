import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Button, ListGroup, Badge, Modal, Image, Form, Spinner, Card } from 'react-bootstrap';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import SiteNavbar from './SiteNavbar';
import SiteFooter from './SiteFooter';

const Checkout = () => {
  const { cart, totalPrice, clearCart, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixQrImage, setPixQrImage] = useState(null);
  const [pixCode, setPixCode] = useState(null);
  const [cep, setCep] = useState('');
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);

  const selectedShippingPrice = selectedOption ? parseFloat(selectedOption.price ?? selectedOption.total_price ?? selectedOption.value ?? 0) || 0 : 0;
  const totalWithShipping = totalPrice + selectedShippingPrice;
  const shippingSelectionRequired = shippingOptions.length > 0 && !selectedOption;
  const canPay = cart.length > 0 && !shippingSelectionRequired;

  const handlePayment = async () => {
    if (cart.length === 0) return;
    if (shippingSelectionRequired) return alert('Selecione uma opção de frete antes de pagar.');

    // Abre a janela antes do await para não ser bloqueada pelo popup blocker
    const paymentWindow = window.open('about:blank', '_blank');

    try {
      const items = cart.map(item => ({
        title: item.name,
        price: item.price,
        quantity: item.quantity,
      }));
      const response = await api.post('/payment', { items, shippingOption: selectedOption, shippingTotal: Number(selectedShippingPrice || 0) });
      const { paymentUrl, init_point, sandbox_init_point, preference_id } = response.data || {};
      const finalPaymentUrl = paymentUrl || init_point || sandbox_init_point;
      console.log('[Checkout] payment response', { preference_id, paymentUrl: finalPaymentUrl, response: response.data });
      if (!finalPaymentUrl) {
        paymentWindow?.close();
        throw new Error('Falha ao obter link de pagamento. Tente novamente.');
      }
      if (paymentWindow) {
        paymentWindow.location.href = finalPaymentUrl;
      } else {
        window.location.href = finalPaymentUrl;
      }
    } catch (error) {
      paymentWindow?.close();
      const msg = error.response?.data?.error || error.message || 'Erro desconhecido';
      console.error('[Checkout] Erro ao processar pagamento:', msg);
      alert(`Erro ao processar o pagamento:\n${msg}`);
    }
  };

  const handlePixPayment = async () => {
    if (cart.length === 0) return;
    if (shippingSelectionRequired) return alert('Selecione uma opção de frete antes de pagar.');
    try {
      const items = cart.map(item => ({
        title: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      const response = await api.post('/payment/pix', { items, shippingOption: selectedOption, shippingTotal: Number(selectedShippingPrice || 0), payer: { email: 'cliente@example.com', name: 'Cliente' } });

      const data = response.data || {};
      const tx = data.point_of_interaction?.transaction_data || {};

      if (!tx.qr_code && !tx.qr_code_base64) {
        throw new Error('O Mercado Pago não retornou o QR Code do PIX.');
      }

      setPixQrImage(tx.qr_code_base64 ? `data:image/png;base64,${tx.qr_code_base64}` : null);
      setPixCode(tx.qr_code || null);
      setShowPixModal(true);
    } catch (error) {
      const msg = error.response?.data?.error || error.message || 'Erro desconhecido';
      console.error('[Checkout PIX] Erro ao processar pagamento PIX:', msg);
      alert(`Erro ao processar pagamento PIX:\n${msg}`);
    }
  };

  const prepareVolumes = () => {
    return cart.map(item => ({
      amount: parseInt(item.quantity, 10) || 1,
      weight: parseFloat(item.weight || 0) || 0.1,
      height: parseFloat(item.dimensions?.height || 1) || 1,
      width: parseFloat(item.dimensions?.width || 1) || 1,
      length: parseFloat(item.dimensions?.length || 1) || 1,
    }));
  };

  const handleQuoteShipping = async () => {
    if (cart.length === 0) return alert('Carrinho vazio para cotação de frete');
    if (!cep || cep.replace(/\D/g, '').length !== 8) return alert('Informe um CEP válido (8 dígitos)');

    setShippingLoading(true);
    setShippingOptions([]);
    setSelectedOption(null);

    try {
      const from = { zipcode: '12235000' }; // CEP da Oba Oba mix
      const to = { zipcode: String(cep).replace(/\D/g, '') };
      const items = prepareVolumes();

      const response = await api.post('/shipping/quote', { from, to, items });
      const data = response.data;

      // Normalizar opções: se for array, use diretamente, senão tente localizar lista dentro do objeto
      let options = [];
      if (Array.isArray(data)) options = data;
      else if (Array.isArray(data.options)) options = data.options;
      else if (Array.isArray(data.results)) options = data.results;
      else if (Array.isArray(data.services)) options = data.services;
      else if (Array.isArray(data.items)) options = data.items;
      else if (data.fallback && Array.isArray(data.options)) options = data.options;
      else options = [data];

      setShippingOptions(options);
      if (data.fallback) {
        alert('A Melhor Envio não está acessível. O frete está sendo calculado em modo de desenvolvimento.');
      }
    } catch (error) {
      console.error('Erro cotação Melhor Envio', error);
      alert('Erro ao cotar frete: ' + (error.response?.data?.error || error.message || 'Erro desconhecido'));
    } finally {
      setShippingLoading(false);
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

            <div className="mb-2">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Subtotal</span>
                <span>R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
              </div>
              {selectedShippingPrice > 0 && (
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>Frete</span>
                  <span>R$ {selectedShippingPrice.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              <div className="d-flex justify-content-between align-items-center mb-4 fs-5 fw-bold">
                <span>Total</span>
                <span>R$ {totalWithShipping.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            <Card className="mb-3">
              <Card.Body>
                <h5>Calcular frete</h5>
                <Form.Group>
                  <Form.Label>CEP de entrega</Form.Label>
                  <Form.Control value={cep} onChange={e => setCep(e.target.value)} placeholder="Ex: 01001-000" />
                </Form.Group>
                <div className="mt-2 d-flex gap-2">
                  <Button onClick={handleQuoteShipping} disabled={shippingLoading}>
                    {shippingLoading ? (<><Spinner animation="border" size="sm" /> Cotando...</>) : 'Calcular Frete'}
                  </Button>
                  {shippingOptions.length > 0 && (
                    <Button variant="outline-secondary" onClick={() => { setShippingOptions([]); setSelectedOption(null); }}>
                      Limpar
                    </Button>
                  )}
                </div>

                {shippingOptions.length > 0 && (
                  <div className="mt-3">
                    <h6>Opções disponíveis</h6>
                    {shippingOptions.map((opt, idx) => (
                      <div key={idx} className={`d-flex align-items-center justify-content-between p-2 border rounded mb-2 ${selectedOption === opt ? 'bg-light' : ''}`}>
                        <div>
                          <div className="fw-semibold">{opt.service_description || opt.name || opt.carrier || `Opção ${idx + 1}`}</div>
                          <div className="text-muted small">Prazo: {opt.delivery_time || opt.estimated_delivery_time || opt.days || '—'}</div>
                        </div>
                        <div className="text-end">
                          <div className="fw-bold">{opt.price ? `R$ ${parseFloat(opt.price).toFixed(2).replace('.', ',')}` : (opt.total_price ? `R$ ${parseFloat(opt.total_price).toFixed(2).replace('.', ',')}` : '—')}</div>
                          <div className="mt-2">
                            <Button size="sm" onClick={() => setSelectedOption(opt)} variant={selectedOption === opt ? 'success' : 'outline-primary'}>
                              {selectedOption === opt ? 'Selecionado' : 'Selecionar'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {selectedOption && (
                      <div className="mt-2 text-muted small">
                        Opção selecionada. Finalize o pagamento para que o pedido seja registrado e o time da Wilboor receba as informações.
                      </div>
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>

            <div className="mb-3">
              {shippingSelectionRequired && (
                <div className="text-danger mb-2">
                  Selecione uma opção de frete antes de prosseguir com o pagamento.
                </div>
              )}
            </div>
            <div className="d-grid gap-2">
              <Button variant="warning" size="lg" onClick={handlePayment} disabled={!canPay}>
                Pagar com cartões e boletos
              </Button>
              <Button variant="success" size="lg" onClick={handlePixPayment} disabled={!canPay}>
                Pagar com PIX
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

      <Modal show={showPixModal} onHide={() => setShowPixModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Pagamento via PIX</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {pixQrImage ? (
            <Image src={pixQrImage} alt="PIX QR" fluid />
          ) : (
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{pixCode}</pre>
          )}
          <p className="mt-3">Abra seu app bancário e aponte para o QR ou copie o código.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPixModal(false)}>Fechar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Checkout;
