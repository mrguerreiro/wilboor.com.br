import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';

export default function SiteFooter() {
  return (
    <footer style={{ backgroundColor: '#222', color: '#ccc', marginTop: '3rem', padding: '2.5rem 0 1rem' }}>
      <Container>
        <Row className="mb-4">

          <Col md={4} className="mb-4 mb-md-0">
            <img
              src="/imagens/logoWilboor.jpg"
              alt="Wilboor"
              style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', marginBottom: 12 }}
            />
            <p className="mb-1" style={{ color: '#fff', fontWeight: 600 }}>Wilboor.com</p>
            <p className="mb-1" style={{ fontSize: '0.85rem' }}>Rua Geraldo Pecorari, 838</p>
            <p className="mb-1" style={{ fontSize: '0.85rem' }}>Macatuba – SP</p>
            <p className="mb-1" style={{ fontSize: '0.85rem' }}>CNPJ: 99.999.999/0001-99</p>
          </Col>

          <Col md={4} className="mb-4 mb-md-0">
            <p style={{ color: '#fff', fontWeight: 600, marginBottom: 12 }}>Institucional</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li className="mb-2">
                <Link to="/quem-somos" style={{ color: '#ccc', textDecoration: 'none' }}>
                  Quem Somos
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/politica-de-privacidade" style={{ color: '#ccc', textDecoration: 'none' }}>
                  Política de Privacidade
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/termos-de-uso" style={{ color: '#ccc', textDecoration: 'none' }}>
                  Termos de Uso
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/trocas-e-devolucoes" style={{ color: '#ccc', textDecoration: 'none' }}>
                  Trocas e Devoluções
                </Link>
              </li>
            </ul>
          </Col>

          <Col md={4}>
            <p style={{ color: '#fff', fontWeight: 600, marginBottom: 12 }}>Contato</p>
            <p className="mb-1" style={{ fontSize: '0.85rem' }}>wilboor.com@gmail.com</p>
            <p className="mb-1" style={{ fontSize: '0.85rem' }}>(14) 98108-4415</p>
          </Col>

        </Row>

        <hr style={{ borderColor: '#444' }} />
        <p className="text-center mb-0" style={{ fontSize: '0.8rem', color: '#888' }}>
          © 2025 Wilboor.com — Todos os direitos reservados
        </p>
      </Container>
    </footer>
  );
}
