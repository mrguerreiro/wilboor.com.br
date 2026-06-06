const fs = require('fs');
const path = require('path');
const express = require('express');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const { sendEmail } = require('../utils/mailer');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const router = express.Router();
const debugPath = path.join(__dirname, '..', 'pix_debug.log');

console.log('[routes/payment] loaded');
console.log('[routes/payment] dirname:', __dirname);

const mercadoPagoModeEnv = process.env.MERCADO_PAGO_MODE?.trim().toLowerCase();
const sandboxToken = process.env.MERCADO_PAGO_SANDBOX_ACCESS_TOKEN?.trim();
const productionToken = process.env.MERCADO_PAGO_ACCESS_TOKEN?.trim();

const mercadoPagoMode = mercadoPagoModeEnv === 'sandbox'
    ? 'sandbox'
    : mercadoPagoModeEnv === 'production'
        ? 'production'
        : sandboxToken?.startsWith('TEST-')
            ? 'sandbox'
            : 'production';

const mercadoPagoAccessToken = mercadoPagoMode === 'sandbox'
    ? sandboxToken
    : mercadoPagoMode === 'production'
        ? productionToken
        : productionToken || sandboxToken;

if (mercadoPagoMode === 'sandbox' && !sandboxToken && productionToken) {
    console.warn('[routes/payment] MERCADO_PAGO_MODE=sandbox definido, mas MERCADO_PAGO_SANDBOX_ACCESS_TOKEN não está configurado. Usando production token seria incorreto.');
}

console.log('[routes/payment] Mercado Pago mode:', mercadoPagoMode);
console.log('[routes/payment] Mercado Pago token defined:', !!mercadoPagoAccessToken);
console.log('[routes/payment] Mercado Pago access token prefix:', mercadoPagoAccessToken ? mercadoPagoAccessToken.split('-')[0] : 'none');

const client = new MercadoPagoConfig({ accessToken: mercadoPagoAccessToken, options: { testToken: mercadoPagoMode === 'sandbox' } });

const appendPixLog = (msg) => {
    try {
        fs.appendFileSync(debugPath, msg + '\n');
    } catch (err) {
        console.error('Could not write PIX debug log:', err.message);
    }
};

const safeStringify = (value) => {
    try {
        return JSON.stringify(value, null, 2);
    } catch (_) {
        return String(value);
    }
};

const getMercadoPagoErrorMessage = (error) => {
    if (Array.isArray(error?.cause) && error.cause.length > 0) {
        return error.cause.map(cause => cause.description || cause.message || JSON.stringify(cause)).join(' | ');
    }

    return error?.message || String(error);
};

const getShippingAmountFromOption = (option) => {
    if (!option) return 0;
    const rawValue = option.price ?? option.total_price ?? option.value ?? option.cost ?? option.shipping_cost ?? option.amount ?? option.final_price ?? 0;
    return parseFloat(rawValue) || 0;
};

const formatShippingOption = (option) => {
    if (!option) return 'Não selecionada';
    const name = option.service_description || option.name || option.carrier || 'Serviço de frete';
    const price = option.price || option.total_price || option.value || 0;
    const deadline = option.delivery_time || option.estimated_delivery_time || option.days || 'não informado';
    return `${name} — R$ ${parseFloat(price).toFixed(2).replace('.', ',')} — ${deadline} dias`;
};

const createOrderEmailContent = ({ items, shippingOption, paymentType, paymentLink, paymentId, total }) => {
    const itemRows = items.map(item => `- ${item.title} x${item.quantity} @ R$ ${parseFloat(item.price).toFixed(2).replace('.', ',')} = R$ ${(parseFloat(item.price) * parseInt(item.quantity, 10)).toFixed(2).replace('.', ',')}`).join('\n');
    const shippingText = formatShippingOption(shippingOption);
    const totalText = `Total estimado: R$ ${parseFloat(total).toFixed(2).replace('.', ',')}`;
    const paymentInfo = paymentLink ? `Link de pagamento: ${paymentLink}` : `ID do pagamento: ${paymentId || 'não disponível'}`;

    const text = `Novo pedido Wilboor\n\nItens:\n${itemRows}\n\nFrete: ${shippingText}\n${totalText}\n\nMétodo de pagamento: ${paymentType}\n${paymentInfo}\n\nStatus: pendente\n\nA etiqueta deve ser gerada após a confirmação do pagamento.`;
    const html = `
        <div style="font-family:Arial,sans-serif;color:#222;">
            <h2>Novo pedido Wilboor</h2>
            <p><strong>Itens:</strong></p>
            <ul>${items.map(item => `<li>${item.title} x${item.quantity} @ R$ ${parseFloat(item.price).toFixed(2).replace('.', ',')} = R$ ${(parseFloat(item.price) * parseInt(item.quantity, 10)).toFixed(2).replace('.', ',')}</li>`).join('')}</ul>
            <p><strong>Frete:</strong> ${shippingText}</p>
            <p><strong>${totalText}</strong></p>
            <p><strong>Método de pagamento:</strong> ${paymentType}</p>
            <p>${paymentInfo}</p>
            <p><strong>Status:</strong> pendente</p>
            <p>Após a confirmação do pagamento, a etiqueta poderá ser gerada.</p>
        </div>
    `;

    return { text, html };
};

const notifyContactAboutOrder = async (orderData) => {
    const subject = `Novo pedido Wilboor - ${orderData.paymentType}`;
    const { html, text } = createOrderEmailContent(orderData);
    await sendEmail({
        to: 'contato@wilboor.com.br',
        subject,
        html,
        text,
    });
};

const ensureMercadoPagoToken = () => {
    if (!mercadoPagoAccessToken) {
        throw new Error('Token do Mercado Pago não configurado. Defina MERCADO_PAGO_SANDBOX_ACCESS_TOKEN ou MERCADO_PAGO_ACCESS_TOKEN no arquivo backend/.env.');
    }

    if (mercadoPagoMode === 'sandbox' && !mercadoPagoAccessToken.startsWith('TEST-')) {
        throw new Error('Credencial Mercado Pago inválida para sandbox. MERCADO_PAGO_MODE=sandbox exige um access token de teste iniciado por TEST-. Ajuste MERCADO_PAGO_SANDBOX_ACCESS_TOKEN ou MERCADO_PAGO_ACCESS_TOKEN no backend/.env para um token TEST-.');
    }

    if (mercadoPagoMode === 'production' && mercadoPagoAccessToken.startsWith('TEST-')) {
        throw new Error('Credencial Mercado Pago inválida para produção. MERCADO_PAGO_MODE=production exige um access token de produção iniciado por APP_USR-. Ajuste MERCADO_PAGO_ACCESS_TOKEN no backend/.env.');
    }
};

router.post('/', async (req, res) => {
    const { items, shippingOption, shippingTotal } = req.body;

    console.log('[routes/payment] / POST called', {
        itemsCount: items?.length || 0,
        shippingTotal,
        shippingOption,
    });

    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Carrinho vazio.' });
    }

    try {
        ensureMercadoPagoToken();
        const shippingAmount = Number(shippingTotal) || getShippingAmountFromOption(shippingOption);
        const preferenceItems = items.map(item => ({
            title: String(item.title),
            unit_price: parseFloat(item.price),
            quantity: parseInt(item.quantity, 10),
            currency_id: 'BRL',
        }));

        if (shippingAmount > 0) {
            preferenceItems.push({
                title: 'Frete',
                unit_price: Number(shippingAmount.toFixed(2)),
                quantity: 1,
                currency_id: 'BRL',
            });
        }

        const preferenceBody = {
            external_reference: `wilboor-${Date.now()}`,
            items: preferenceItems,
        };
        console.log('[routes/payment] Mercado Pago preference body:', JSON.stringify(preferenceBody, null, 2));

        const preference = new Preference(client);
        let response;
        try {
            response = await preference.create({ body: preferenceBody });
        } catch (prefError) {
            appendPixLog('[routes/payment] PREFERENCE CREATE ERROR: ' + safeStringify(prefError));
            throw prefError;
        }

        appendPixLog('[routes/payment] PREFERENCE RESPONSE: ' + safeStringify({
            id: response?.id,
            init_point: response?.init_point,
            sandbox_init_point: response?.sandbox_init_point,
            status: response?.status,
        }));

        const paymentUrl = mercadoPagoMode === 'sandbox'
            ? (response.sandbox_init_point || response.init_point)
            : response.init_point;

        appendPixLog('[routes/payment] paymentUrl: ' + paymentUrl);

        if (shippingOption) {
            await notifyContactAboutOrder({
                items,
                shippingOption,
                paymentType: 'checkout',
                paymentLink: paymentUrl,
                total: items.reduce((sum, item) => sum + (parseFloat(item.price) * parseInt(item.quantity, 10)), 0) + shippingAmount,
            }).catch(err => console.error('[Payment] Falha ao enviar e-mail de pedido:', err.message || err));
        }

        res.json({
            paymentUrl,
            init_point: response.init_point,
            sandbox_init_point: response.sandbox_init_point,
            preference_id: response.id,
            total: items.reduce((sum, item) => sum + (parseFloat(item.price) * parseInt(item.quantity, 10)), 0) + shippingAmount,
            shippingAmount,
            items: preferenceItems,
        });
    } catch (error) {
        const detail = getMercadoPagoErrorMessage(error);
        console.error('[Payment] Erro ao criar preferência:', error);
        res.status(500).json({ error: detail });
    }
});

// Rota para criar pagamento via PIX (gera QR code)

router.post('/pix', async (req, res) => {
    const log = appendPixLog;

    log('[routes/payment] /pix called');
    log('[routes/payment] mode: ' + mercadoPagoMode);
    log('[routes/payment] token prefix: ' + (mercadoPagoAccessToken ? mercadoPagoAccessToken.split('-')[0] : 'undefined'));
    log('[routes/payment] body: ' + JSON.stringify(req.body));
    const { items, payer, shippingOption, shippingTotal } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Carrinho vazio.' });
    }

    try {
        ensureMercadoPagoToken();

        const parsedItems = items.map(item => {
            const parsedPrice = parseFloat(item.price);
            const parsedQuantity = parseInt(item.quantity, 10) || 1;
            const lineTotal = parsedPrice * parsedQuantity;
            return {
                ...item,
                parsedPrice,
                parsedQuantity,
                lineTotal,
            };
        });
        log('[routes/payment] parsedItems: ' + JSON.stringify(parsedItems, null, 2));

        const rawItemsTotal = parsedItems.reduce((sum, item) => sum + item.lineTotal, 0);
        const shippingAmount = Number(shippingTotal) || getShippingAmountFromOption(shippingOption);
        const amount = rawItemsTotal + shippingAmount;
        log('[routes/payment] calculated amount: ' + amount + ' (items ' + rawItemsTotal + ' + shipping ' + shippingAmount + ')');

        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({ error: 'Valor inválido para pagamento PIX.' });
        }

        const paymentData = {
            transaction_amount: Number(amount.toFixed(2)),
            description: `${items.map(i => i.title).join(', ')}${shippingAmount > 0 ? ` + frete R$ ${shippingAmount.toFixed(2)}` : ''}`,
            payment_method_id: 'pix',
            payer: {
                email: (payer && payer.email) || 'cliente@example.com',
                first_name: (payer && payer.name) || 'Cliente',
            },
        };

        log('[routes/payment] paymentData: ' + JSON.stringify(paymentData));

        const paymentInstance = new Payment(client);
        const response = await paymentInstance.create({ body: paymentData });

        log('[routes/payment] Mercado Pago response id: ' + (response?.id || 'sem id'));
        log('[routes/payment] Mercado Pago payment response:', JSON.stringify(response, null, 2));

        await notifyContactAboutOrder({
            items: parsedItems,
            shippingOption,
            paymentType: 'pix',
            paymentId: response?.id,
            total: amount,
        }).catch(err => console.error('[Payment PIX] Falha ao enviar e-mail de pedido:', err.message || err));

        // O SDK v2 retorna o pagamento diretamente (não em response.body).
        res.json(response);
    } catch (error) {
        const detail = getMercadoPagoErrorMessage(error);
        log('[routes/payment] Mercado Pago error: ' + safeStringify(error));
        console.error('[Payment PIX] Erro ao criar pagamento PIX:', error);
        res.status(error?.status || 500).json({ error: detail });
    }
});

module.exports = router;

// Debug: listar rotas deste router
try {
    const r = router.stack
        .filter(s => s.route)
        .map(s => ({ path: s.route.path, methods: Object.keys(s.route.methods) }));
    console.log('[routes/payment] registered routes:', JSON.stringify(r, null, 2));
} catch (err) {
    console.error('[routes/payment] erro ao listar rotas do router:', err.message);
}
