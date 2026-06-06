import React, { useState, useEffect } from 'react';
import { Dropdown, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { DEPARTMENTS } from '../utils/departments';
import CartDrawer from './CartDrawer';
import './SiteNavbar.css';

const GridIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3A1.5 1.5 0 0 1 15 10.5v3A1.5 1.5 0 0 1 13.5 15h-3A1.5 1.5 0 0 1 9 13.5v-3z"/>
  </svg>
);

const ChevronIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" className="chev">
    <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
  </svg>
);

const CartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
    <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .49.598l-1.5 7A.5.5 0 0 1 13 11H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 6.5h8.17L13.898 4H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
  </svg>
);

const TruckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
    <path d="M0 3.5A1.5 1.5 0 0 1 1.5 2h9A1.5 1.5 0 0 1 12 3.5V5h1.02a1.5 1.5 0 0 1 1.17.563l1.481 1.85a1.5 1.5 0 0 1 .329.938V10.5a1.5 1.5 0 0 1-1.5 1.5H14a2 2 0 1 1-4 0H5a2 2 0 1 1-3.998-.085A1.5 1.5 0 0 1 0 10.5v-7zm1.294 7.456A1.999 1.999 0 0 1 4.732 11h5.536a2.01 2.01 0 0 1 .732-.732V3.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .294.456zM12 10a2 2 0 0 1 1.732 1h.768a.5.5 0 0 0 .5-.5V8.35a.5.5 0 0 0-.11-.312l-1.48-1.85A.5.5 0 0 0 13.02 6H12v4zm-9 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm9 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
  </svg>
);

const HamburgerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
    <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
  </svg>
);

export default function SiteNavbar() {
  const { totalItems } = useCart();
  const [showCart, setShowCart] = useState(false);
  const [open, setOpen] = useState(false);
  const [customer, setCustomer] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem('customerUser');
    if (raw) {
      try { setCustomer(JSON.parse(raw)); } catch (_) { setCustomer(null); }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerUser');
    setCustomer(null);
    navigate('/');
  };

  const firstName = customer?.name?.split(' ')[0] || '';
  const initial = (customer?.name || '?').trim().charAt(0).toUpperCase();

  return (
    <>
      <div className="topbar-info">
        <Container>
          <div className="topbar-inner">
            <span className="topbar-msg">
              {/*
              <TruckIcon />
              <span className="topbar-accent">Frete grátis</span> em compras acima de R$ 199
              */}
            </span>
            
            <span className="topbar-links">
              <Link to="/quem-somos">Quem somos</Link>
              <Link to="/trocas-e-devolucoes">Trocas e devoluções</Link>
              <Link to="/politica-de-privacidade">Privacidade</Link>
            </span>
          </div>
        </Container>
      </div>

      <nav className="site-navbar">
        <Container>
          <div className="navbar-inner">
            <Link to="/" className="site-brand">
              <img src="/imagens/logoWilboor.jpg" alt="Wilboor" />
              <span className="site-brand-text">
                <span className="brand-name">Wilboor</span>
                <span className="brand-tag">Loja Online</span>
              </span>
            </Link>

            <button
              type="button"
              className="site-toggle"
              aria-label="Abrir menu"
              onClick={() => setOpen(o => !o)}
            >
              <HamburgerIcon />
            </button>

            <div className={`navbar-collapsible ${open ? 'open' : ''}`}>
              <Dropdown>
                <Dropdown.Toggle as="button" className="dept-toggle">
                  <GridIcon />
                  Departamentos
                  <ChevronIcon />
                </Dropdown.Toggle>
                <Dropdown.Menu className="site-dropdown-menu">
                  {DEPARTMENTS.map(dept => (
                    <Dropdown.Item
                      key={dept.slug}
                      as={Link}
                      to={`/departamento/${dept.slug}`}
                    >
                      {dept.name}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>

              <div className="site-actions">
                {customer ? (
                  <Dropdown align="end">
                    <Dropdown.Toggle as="button" className="user-toggle">
                      <span>Olá, {firstName}</span>
                      <span className="user-avatar">{initial}</span>
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="site-dropdown-menu">
                      <Dropdown.Item disabled style={{ fontSize: '0.78rem', color: '#888' }}>
                        {customer.email}
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item as={Link} to="/minha-conta">Minha conta</Dropdown.Item>
                      <Dropdown.Item onClick={handleLogout}>Sair da conta</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                ) : (
                  <>
                    <Link to="/login" className="btn-pill btn-pill-ghost">Entrar</Link>
                    <Link to="/cadastro" className="btn-pill btn-pill-dark">Cadastrar</Link>
                  </>
                )}

                <button
                  onClick={() => setShowCart(true)}
                  aria-label="Abrir carrinho"
                  className="cart-button"
                >
                  <CartIcon />
                  {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
                </button>
              </div>
            </div>
          </div>
        </Container>
      </nav>

      <CartDrawer show={showCart} onHide={() => setShowCart(false)} />
    </>
  );
}
