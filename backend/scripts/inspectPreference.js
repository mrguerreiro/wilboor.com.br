const fs = require('fs');
const path = require('path');
const https = require('https');

const env = {};
const envText = fs.readFileSync(path.resolve(__dirname, '../.env'), 'utf8');
envText.split(/\r?\n/).forEach((line) => {
  const match = line.match(/^([^#=]+)=([\s\S]*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, '');
  }
});

const token = env.MERCADO_PAGO_ACCESS_TOKEN;
if (!token) {
  console.error('Missing MERCADO_PAGO_ACCESS_TOKEN');
  process.exit(1);
}

const prefId = process.argv[2];
if (!prefId) {
  console.error('Usage: node inspectPreference.js <pref_id>');
  process.exit(1);
}

const opts = {
  hostname: 'api.mercadopago.com',
  path: `/checkout/preferences/${prefId}`,
  method: 'GET',
  headers: {
    Authorization: `Bearer ${token}`,
  },
};

const req = https.request(opts, (res) => {
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => {
    console.log('status', res.statusCode);
    try {
      console.log(JSON.stringify(JSON.parse(body), null, 2));
    } catch (err) {
      console.error('Body parse error', err.message);
      console.log(body);
    }
  });
});
req.on('error', (err) => {
  console.error('Request error', err.message);
});
req.end();
