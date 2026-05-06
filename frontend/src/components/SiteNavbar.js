import React, { useState } from 'react';
import { Navbar, Nav, Dropdown, Container, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { DEPARTMENTS } from '../utils/departments';
import CartDrawer from './CartDrawer';

const GridIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3A1.5 1.5 0 0 1 15 10.5v3A1.5 1.5 0 0 1 13.5 15h-3A1.5 1.5 0 0 1 9 13.5v-3z"/>
  </svg>
);

const CartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="33"
    height="33"
    fill="currentColor"
    viewBox="0 0 16 16"
  >
    <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM5 13a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
  </svg>
);

export default function SiteNavbar() {
  const { totalItems } = useCart();
  const [showCart, setShowCart] = useState(false);

  return (
    <>
      <Navbar bg="warning" expand="lg" style={{ fontSize: '1.9rem', padding: '0.75rem 0' }}>
        <Container>
          <Navbar.Brand as={Link} to="/">
            <img
              src="/imagens/logoWilboor.jpg"
              alt="Wilboor"
              style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }}
            />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="main-navbar" />
          <Navbar.Collapse id="main-navbar">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <Dropdown>
                <Dropdown.Toggle
                  variant="dark"
                  id="dropdown-departments"
                  style={{
                    borderRadius: 24,
                    padding: '6px 18px',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    border: 'none',
                    letterSpacing: '0.02em',
                  }}
                >
                  <GridIcon />
                  Departamentos
                </Dropdown.Toggle>
                <Dropdown.Menu
                  style={{
                    borderRadius: 12,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                    border: 'none',
                    padding: 6,
                    minWidth: 230,
                    marginTop: 6,
                  }}
                >
                  {DEPARTMENTS.map(dept => (
                    <Dropdown.Item
                      key={dept.slug}
                      as={Link}
                      to={`/departamento/${dept.slug}`}
                      style={{ borderRadius: 8, padding: '8px 14px', fontSize: '0.9rem' }}
                    >
                      {dept.name}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </Nav>

            <Nav className="ms-auto align-items-center">
              <button
                onClick={() => setShowCart(true)}
                aria-label="Abrir carrinho"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  padding: '4px 8px',
                  lineHeight: 1,
                }}
              >
                <CartIcon />
                {totalItems > 0 && (
                  <Badge
                    bg="danger"
                    pill
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      fontSize: '0.93rem',
                      transform: 'translate(40%, -30%)',
                    }}
                  >
                    {totalItems}
                  </Badge>
                )}
              </button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <CartDrawer show={showCart} onHide={() => setShowCart(false)} />
    </>
  );
}
