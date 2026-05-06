const express = require('express');
const router = express.Router();
const { MercadoPagoConfig, Preference } = require('mercadopago');

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN });

router.post('/', async (req, res) => {
    const { items } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Carrinho vazio.' });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    try {
        const preference = new Preference(client);
        const response = await preference.create({
            body: {
                items: items.map(item => ({
                    title: String(item.title),
                    unit_price: parseFloat(item.price),
                    quantity: parseInt(item.quantity, 10),
                    currency_id: 'BRL',
                })),
            },
        });
        res.json({ init_point: response.init_point });
    } catch (error) {
        const detail = error?.cause ?? error?.message ?? String(error);
        console.error('[Payment] Erro ao criar preferência:', JSON.stringify(detail, null, 2));
        res.status(500).json({ error: JSON.stringify(detail) });
    }
});

module.exports = router;
