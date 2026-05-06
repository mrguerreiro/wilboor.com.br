import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import api from '../services/api';
import SiteNavbar from './SiteNavbar';
import SiteFooter from './SiteFooter';
import ProductCard from './ProductCard';
import { slugToName } from '../utils/departments';

export default function DepartmentPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const departmentName = slugToName(slug);

  useEffect(() => {
    setLoading(true);
    api.get('/products')
      .then(res => {
        const filtered = res.data.filter(
          p => p.department?.toLowerCase() === departmentName.toLowerCase()
        );
        setProducts(filtered);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [departmentName]);

  return (
    <div>
      <SiteNavbar />
      <Container className="mt-4">
        <h2 className="mb-4">{departmentName}</h2>

        {loading && <p className="text-muted">Carregando produtos...</p>}

        {!loading && products.length === 0 && (
          <p className="text-muted">Nenhum produto neste departamento no momento.</p>
        )}

        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
          {products.map(produto => (
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
