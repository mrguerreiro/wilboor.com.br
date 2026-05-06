import React from 'react';
import { Container } from 'react-bootstrap';
import SiteNavbar from '../SiteNavbar';
import SiteFooter from '../SiteFooter';

export default function TrocaseDevolucoes() {
  return (
    <div>
      <SiteNavbar />
      <Container className="mt-4 mb-5" style={{ maxWidth: 800 }}>
        <h1 className="mb-4">Trocas e Devoluções</h1>

        <p>Troca e devolução</p>

        <p>1.O cliente poderá devolver o produto ou trocar que foi adquirido em nosso e-commerce em até 7 dias, seja qual for a razão, conforme a previsão expressa no Código de Defesa do Consumidor em seu art. 49.</p>

        <p>1.1 Para que ocorra a troca ou a devolução é necessário que o produto esteja conforme foi entregue, com todos os acessórios, manual e embalagem, caixa.</p>

        <p>1.2 O produto que será devolvido ou trocado não poderá apresentar qualquer marca de uso, como o produto estar trincado, riscado ou apresentar sinais de quedas.</p>

        <p>2. Se você requisitou a troca do produto o novo será enviado para o endereço e você será notificado sobre o envio via e-mail.</p>

        <p>3. Se você solicitou o reembolso, a devolução do valor ocorrerá da forma como foi efetuado o pagamento.</p>

        <p>3.1 Se foi via cartão de crédito ou débito o valor será creditado ou debitado na fatura atual ou na seguinte do cartão, pois informaremos a administradora do cartão.</p>

        <p>3.2 Se o pagamento foi feito via boleto bancário, o valor de reembolso será restituído dentro de 30 dias úteis diretamente na conta que solicitaremos no momento de sua requisição de devolução.</p>

      </Container>
      <SiteFooter />
    </div>
  );
}
