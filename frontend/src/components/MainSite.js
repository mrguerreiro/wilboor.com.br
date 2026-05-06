import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import api from '../services/api';
import SiteNavbar from './SiteNavbar';
import SiteFooter from './SiteFooter';
import ProductCard from './ProductCard';

function MainSite() {
  const [destaques, setDestaques] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products')
      .then(res => {
        const featured = res.data.filter(p => p.featured);
        setDestaques(featured);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <SiteNavbar />

      <Container className="mt-4">
        <h2 className="mb-4">Produtos em Destaque</h2>

        {loading && <p className="text-muted">Carregando produtos...</p>}

        {!loading && destaques.length === 0 && (
          <p className="text-muted">Nenhum produto em destaque no momento.</p>
        )}

        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
          {destaques.map(produto => (
            <Col key={produto._id}>
              <ProductCard produto={produto} />
            </Col>
          ))}
        </Row>
      </Container>

      <SiteFooter />
    </div>
  );
}

export default MainSite;
