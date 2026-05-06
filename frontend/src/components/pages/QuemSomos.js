import React from 'react';
import { Container } from 'react-bootstrap';
import SiteNavbar from '../SiteNavbar';
import SiteFooter from '../SiteFooter';

export default function QuemSomos() {
  return (
    <div>
      <SiteNavbar />
      <Container className="mt-4 mb-5" style={{ maxWidth: 800 }}>
        <h1 className="mb-4">Quem Somos</h1>

        <p>Fundada em janeiro de 2025, a Wilboor.com.br nasceu com o propósito de levar para o ambiente digital a praticidade e a variedade das tradicionais lojas físicas conhecidas como “Tem Tudo”.</p>
        <p>Sediada em Macatuba, no interior do estado de São Paulo, nossa loja atende clientes em todo o Brasil por meio do modelo de comércio eletrônico conhecido como dropshipping, garantindo acesso a uma ampla gama de produtos com conveniência e eficiência.</p>
        <p>Trabalhamos com fornecedores selecionados e priorizamos a qualidade em cada item oferecido, abrangendo diversos departamentos para atender às mais variadas necessidades do dia a dia.</p>
        <p>Estamos em constante evolução, buscando ampliar nosso portfólio e trazer novidades que agreguem valor à experiência de compra dos nossos clientes.</p>
        <p>Na Wilboor.com.br, nosso compromisso é oferecer praticidade, variedade e confiança em cada pedido.</p>
        <p>Boas Compras!</p>

      </Container>
      <SiteFooter />
    </div>
    );
}
