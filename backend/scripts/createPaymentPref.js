const http = require('http');
const payload = {
  items: [{ title: 'Teste Produto', price: 10.0, quantity: 1 }],
  shippingOption: { service_description: 'Sedex', price: 8.5, delivery_time: 3 },
  shippingTotal: 8.5
};
const data = JSON.stringify(payload);
const opts = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/payment',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
  },
};

const req = http.request(opts, (res) => {
  let body = '';
  res.on('data', (chunk) => (body += chunk));
  res.on('end', () => {
    console.log('status', res.statusCode);
    try {
      console.log(JSON.stringify(JSON.parse(body), null, 2));
    } catch (err) {
      console.error('body parse error', err.message);
      console.log(body);
    }
  });
});
req.on('error', (err) => console.error('request error', err.message));
req.write(data);
req.end();
