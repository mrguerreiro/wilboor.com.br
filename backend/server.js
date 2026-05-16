const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Conexão ao MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const paymentRoutes = require('./routes/payment');
const adminAuthRoutes = require('./routes/adminAuth');
const adminCustomerRoutes = require('./routes/adminCustomers');
const customerAuthRoutes = require('./routes/customerAuth');
const { verifySmtpConnection } = require('./utils/mailer');

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/customers', adminCustomerRoutes);
app.use('/api/auth', customerAuthRoutes);

app.listen(process.env.PORT || 5000, () => {
    console.log('Server is running...');

    verifySmtpConnection()
        .then(() => console.log('[mailer] Conexão SMTP verificada com sucesso.'))
        .catch(err => console.error('[mailer] Falha ao verificar SMTP:', err.message));
});