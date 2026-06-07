const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

// Garante que o .env do backend seja carregado mesmo quando o servidor é iniciado pela raiz do projeto.
dotenv.config({ path: path.resolve(__dirname, '.env') });
const app = express();

app.use(helmet({
    contentSecurityPolicy: false,
}));

const allowedOrigins = [
    // localhost sempre permitido (dev local)
    'http://localhost:3000',
    'http://localhost:5173',
    // origens de produção configuradas no .env
    ...(process.env.FRONTEND_URL || '')
        .split(',')
        .map(o => o.trim())
        .filter(Boolean)
        .flatMap(origin => {
            const variants = [origin];
            if (origin.startsWith('https://')) variants.push(origin.replace('https://', 'http://'));
            if (origin.startsWith('http://'))  variants.push(origin.replace('http://', 'https://'));
            if (origin.includes('://www.'))    variants.push(origin.replace('://www.', '://'));
            else                               variants.push(origin.replace('://', '://www.'));
            return variants;
        }),
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error('Origem não permitida pelo CORS'));
    },
    credentials: true,
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Middleware de logging de requisições (debug)
app.use((req, res, next) => {
    console.log('[request] ', req.method, req.path);
    next();
});

// Conexão ao MongoDB
// authSource deve ser o banco onde o usuário foi criado (wilboor, não admin)
const _baseUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wilboor';
const _dbName = _baseUri.split('/').pop().split('?')[0];
const mongoUri = (process.env.MONGODB_USER && process.env.MONGODB_PASSWORD)
    ? `mongodb://${encodeURIComponent(process.env.MONGODB_USER)}:${encodeURIComponent(process.env.MONGODB_PASSWORD)}@${_baseUri.replace(/^mongodb:\/\//, '')}?authSource=${_dbName}`
    : _baseUri;

mongoose.connect(mongoUri)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const paymentRoutes = require('./routes/payment');
const adminAuthRoutes = require('./routes/adminAuth');
const adminCustomerRoutes = require('./routes/adminCustomers');
const adminProductRoutes = require('./routes/adminProducts');
const customerAuthRoutes = require('./routes/customerAuth');
const shippingRoutes = require('./routes/shipping');
const { verifySmtpConnection, sendEmail } = require('./utils/mailer');

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/customers', adminCustomerRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/auth', customerAuthRoutes);
app.use('/api/shipping', shippingRoutes);

app.all('/callback', async (req, res) => {
    console.log('[callback] received', {
        method: req.method,
        path: req.path,
        query: req.query,
        body: req.body,
    });

    if (req.method === 'GET') {
        return res.send('Callback endpoint ativo.');
    }

    if (req.method === 'POST') {
        const payload = req.body;
        const paymentId = payload?.data?.id || payload?.data?.object?.id || payload?.id;
        const topic = payload?.topic || payload?.type || payload?.action || 'unknown';
        const status = payload?.status || payload?.transaction_status || payload?.data?.status || 'unknown';

        if (paymentId) {
            try {
                await sendEmail({
                    to: 'contato@wilboor.com.br',
                    subject: `Callback de pagamento Wilboor: ${paymentId}`,
                    text: `Recebido callback de pagamento:\n\nPagamento: ${paymentId}\nTipo: ${topic}\nStatus: ${status}\n\nPayload:\n${JSON.stringify(payload, null, 2)}`,
                    html: `<div style="font-family: Arial, sans-serif; color: #222;">
                        <h2>Callback de pagamento Wilboor</h2>
                        <p><strong>Pagamento:</strong> ${paymentId}</p>
                        <p><strong>Tipo:</strong> ${topic}</p>
                        <p><strong>Status:</strong> ${status}</p>
                        <pre style="white-space: pre-wrap; background: #f5f5f5; padding: 12px; border-radius: 6px;">${JSON.stringify(payload, null, 2)}</pre>
                    </div>`,
                });
            } catch (emailError) {
                console.error('[callback] Erro ao enviar e-mail de callback:', emailError);
            }
        }
    }

    res.json({
        status: 'callback recebido',
        method: req.method,
        query: req.query,
        body: req.body,
    });
});

// Rota temporária para listar rotas registradas (ajuda no debug)
app.get('/__routes', (req, res) => {
    const routes = [];
    (app._router?.stack || []).forEach(mw => {
        if (mw.route) {
            const path = mw.route.path;
            const methods = Object.keys(mw.route.methods).join(',');
            routes.push({ path, methods });
        } else if (mw.name === 'router' && mw.handle?.stack) {
            mw.handle.stack.forEach(handler => {
                if (handler.route) {
                    routes.push({ path: handler.route.path, methods: Object.keys(handler.route.methods).join(',') });
                }
            });
        }
    });
    res.json(routes);
});

// Logar rotas no startup (debug)
function listRoutes() {
    try {
        const routes = [];
        if (!app._router || !app._router.stack) {
            console.log('No router stack available yet');
            return;
        }
        (app._router?.stack || []).forEach(mw => {
            if (mw.route) {
                const path = mw.route.path;
                const methods = Object.keys(mw.route.methods).join(',');
                routes.push({ path, methods });
            } else if (mw.name === 'router' && mw.handle?.stack) {
                mw.handle.stack.forEach(handler => {
                    if (handler.route) {
                        routes.push({ path: handler.route.path, methods: Object.keys(handler.route.methods).join(',') });
                    }
                });
            }
        });
        console.log('Registered routes:', JSON.stringify(routes, null, 2));
    } catch (err) {
        console.error('Erro ao listar rotas:', err.message);
    }
}

console.log('CWD', process.cwd());
app.listen(process.env.PORT || 5000, () => {
    console.log('Server is running...');

    verifySmtpConnection()
        .then(() => console.log('[mailer] Conexão SMTP verificada com sucesso.'))
        .catch(err => console.error('[mailer] Falha ao verificar SMTP:', err.message));
});

// Chamar listRoutes depois de iniciar
if (typeof listRoutes === 'function') {
    setTimeout(listRoutes, 500);
}