const path = require('path');
const express = require('express');
const https = require('https');
const { URL } = require('url');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const router = express.Router();
const MELHOR_ENVIO_BASE_URL = process.env.MELHOR_ENVIO_BASE_URL?.trim() || 'https://melhorenvio.com.br';
const MELHOR_ENVIO_TOKEN = process.env.MELHOR_ENVIO_TOKEN?.trim();
const isProduction = process.env.NODE_ENV === 'production';

const ensureMelhorEnvioToken = () => {
  if (!MELHOR_ENVIO_TOKEN && isProduction) {
    throw new Error('Token da Melhor Envio não configurado. Defina MELHOR_ENVIO_TOKEN no arquivo backend/.env.');
  }
};

const createDevShippingQuote = (volumes) => {
  const totalWeight = volumes.reduce((sum, item) => sum + (item.weight || 0) * (item.amount || 1), 0);
  const basePrice = Math.max(10, 5 + totalWeight * 2);

  return [
    {
      service_description: 'Melhor Envio Simulado - PAC',
      price: parseFloat((basePrice + 10).toFixed(2)),
      delivery_time: 8,
    },
    {
      service_description: 'Melhor Envio Simulado - Sedex',
      price: parseFloat((basePrice + 30).toFixed(2)),
      delivery_time: 3,
    },
  ];
};

const createDevShippingLabel = (selectedOption) => ({
  id: 'DEV-MELHOR-ENVIO-0001',
  service_description: selectedOption?.service_description || 'Envio Simulado',
  label_url: 'https://via.placeholder.com/500x500.png?text=Etiqueta+Simulada',
  status: 'created',
});

const sendMelhorEnvioRequest = (endpoint, payload) => {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, MELHOR_ENVIO_BASE_URL);
    const body = JSON.stringify(payload);

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        Authorization: `Bearer ${MELHOR_ENVIO_TOKEN}`,
      },
    };

    const req = https.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = data ? JSON.parse(data) : null;
        } catch (parseError) {
          return reject(new Error(`Falha ao analisar resposta da Melhor Envio: ${parseError.message}`));
        }
        resolve({ status: res.statusCode, data: parsed });
      });
    });

    req.on('error', (err) => reject(err));
    req.write(body);
    req.end();
  });
};

const normalizeItems = (items = []) => {
  return items.map(item => ({
    amount: parseInt(item.quantity, 10) || 1,
    weight: parseFloat(item.weight || item.weight_kg || item.kg || 0) || 0.1,
    height: parseFloat(item.dimensions?.height || item.height || 1) || 1,
    width: parseFloat(item.dimensions?.width || item.width || 1) || 1,
    length: parseFloat(item.dimensions?.length || item.length || 1) || 1,
  }));
};

router.post('/quote', async (req, res) => {
  let volumes = [];
  try {
    ensureMelhorEnvioToken();

    const { from, to, items, services } = req.body;

    if (!from?.zipcode || !to?.zipcode) {
      return res.status(400).json({ error: 'Os CEPs de origem e destino são obrigatórios.' });
    }

    volumes = normalizeItems(items);
    if (volumes.length === 0) {
      return res.status(400).json({ error: 'É necessário enviar ao menos um item para cotação de frete.' });
    }

    const payload = {
      from: {
        zipcode: String(from.zipcode).replace(/\D+/g, ''),
        state: from.state || 'SP',
        city: from.city || '',
        country: 'BR',
      },
      to: {
        zipcode: String(to.zipcode).replace(/\D+/g, ''),
        state: to.state || '',
        city: to.city || '',
        country: 'BR',
      },
      volumes,
      services: Array.isArray(services) && services.length > 0 ? services : undefined,
    };

    const response = await sendMelhorEnvioRequest('/api/v2/me/shipment/calculate', payload);
    if (response.status < 200 || response.status >= 300) {
      return res.status(response.status).json({ error: response.data });
    }

    res.json(response.data);
  } catch (error) {
    console.error('[shipping] Erro Melhor Envio:', error.message || error, 'code:', error.code);
    if (!isProduction && ['ENOTFOUND', 'EAI_AGAIN', 'ETIMEDOUT', 'ECONNREFUSED'].includes(error.code)) {
      return res.json({
        fallback: true,
        options: createDevShippingQuote(volumes || []),
        message: 'Cotação de frete simulada localmente porque a Melhor Envio não está acessível.',
      });
    }

    const message = ['ENOTFOUND', 'EAI_AGAIN'].includes(error.code)
      ? 'Não foi possível conectar à Melhor Envio. Verifique a conexão de rede.'
      : error.message || 'Erro ao cotar frete Melhor Envio.';
    res.status(500).json({ error: message });
  }
});

// Rota para criar o envio / gerar etiqueta (proxy simplificado)
router.post('/create', async (req, res) => {
  try {
    ensureMelhorEnvioToken();

    const body = req.body;

    // Proxy para a API Melhor Envio: criar envio (a API real pode exigir campos específicos)
    const response = await sendMelhorEnvioRequest('/v2/me/shipment', body);
    if (response.status < 200 || response.status >= 300) {
      return res.status(response.status).json({ error: response.data });
    }

    // Retorna o objeto criado (pode conter id, label_url, etc.)
    res.json(response.data);
  } catch (error) {
    console.warn('[shipping/create] Melhor Envio aviso:', error.message || error);
    if (['ENOTFOUND', 'EAI_AGAIN'].includes(error.code)) {
      return res.json({
        fallback: true,
        ...createDevShippingLabel(req.body.selected || null),
        message: 'Etiqueta simulada localmente porque a Melhor Envio não está acessível.',
      });
    }

    const message = error.code === 'ENOTFOUND'
      ? 'Não foi possível resolver o host da Melhor Envio. Verifique a conexão de rede e o DNS.'
      : error.message || 'Erro ao criar envio Melhor Envio.';
    res.status(500).json({ error: message });
  }
});

module.exports = router;
