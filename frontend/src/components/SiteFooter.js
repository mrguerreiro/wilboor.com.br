import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import './SiteFooter.css';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <Container>
        <Row className="mb-4">

          <Col md={4} className="mb-4 mb-md-0">
            <img
              src="/imagens/logoWilboor.jpg"
              alt="Wilboor"
              className="footer-logo"
            />
            <p className="footer-strong mb-1">Wilboor.com</p>
            <p className="footer-line">Rua Geraldo Pecorari, 838</p>
            <p className="footer-line">Macatuba – SP</p>
            <p className="footer-line">CNPJ: 99.999.999/0001-99</p>
          </Col>

          <Col md={4} className="mb-4 mb-md-0">
            <p className="footer-strong">Institucional</p>
            <ul className="footer-list">
              <li><Link to="/quem-somos">Quem Somos</Link></li>
              <li><Link to="/politica-de-privacidade">Política de Privacidade</Link></li>
              <li><Link to="/termos-de-uso">Termos de Uso</Link></li>
              <li><Link to="/trocas-e-devolucoes">Trocas e Devoluções</Link></li>
            </ul>
          </Col>

          <Col md={4}>
            <p className="footer-strong">Contato</p>
            <p className="footer-line">wilboor.com@gmail.com</p>
            <p className="footer-line">(14) 98108-4415</p>
          </Col>

        </Row>

        <hr className="footer-divider" />
        <p className="footer-copy">© 2025 Wilboor.com — Todos os direitos reservados</p>
      </Container>
    </footer>
  );
}
