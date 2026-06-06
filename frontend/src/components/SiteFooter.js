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
            <p className="footer-line">Macatuba – SP</p>
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
            <p className="footer-line">
              <a className="footer-contact-link" href="mailto:contato@wilboor.com.br">
                contato@wilboor.com.br
              </a>
            </p>
            <p className="footer-line">
              <a className="footer-contact-link" href="https://wa.me/5514996489557" target="_blank" rel="noreferrer">
                <span className="footer-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.148-1.758-.867-2.03-.967-.273-.099-.472-.148-.672.149-.198.297-.768.967-.942 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.447-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.52-.074-.148-.672-1.612-.921-2.207-.242-.579-.487-.5-.672-.51-.173-.007-.372-.009-.571-.009-.198 0-.52.074-.792.372-.273.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.1 3.2 5.083 4.487.711.307 1.263.49 1.694.627.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.413-.074-.123-.273-.198-.571-.347z"/>
                    <path d="M20.52 3.48A11.8 11.8 0 0 0 12 0C5.373 0 0 5.373 0 12c0 2.112.589 4.171 1.707 5.962L0 24l6.225-1.636A11.941 11.941 0 0 0 12 24c6.627 0 12-5.373 12-12 0-3.198-1.25-6.2-3.48-8.52zM12 21.7c-1.94 0-3.82-.534-5.43-1.543l-.38-.226-3.693.97.984-3.605-.247-.372A9.702 9.702 0 0 1 2.3 12C2.3 6.249 6.249 2.3 12 2.3S21.7 6.249 21.7 12 17.751 21.7 12 21.7z"/>
                  </svg>
                </span>
                (14) 99648-9557
              </a>
            </p>
          </Col>

        </Row>

        <hr className="footer-divider" />
        <p className="footer-copy">© 2025 Wilboor.com — Todos os direitos reservados</p>
      </Container>
    </footer>
  );
}
      