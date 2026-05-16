const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendVerificationEmail } = require('../utils/mailer');

const TOKEN_EXPIRES_HOURS = 24;

const buildVerifyUrl = (token) => {
    const base = process.env.FRONTEND_URL || 'http://localhost:3000';
    return `${base.replace(/\/$/, '')}/verificar-email/${token}`;
};

const signCustomerToken = (user) => jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
);

const publicUser = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    birthDate: user.birthDate,
    address: user.address,
    role: user.role,
    isEmailVerified: user.isEmailVerified
});

const validateCustomerPayload = ({ name, birthDate, phone, address }) => {
    if (!name || !birthDate || !phone || !address) {
        return 'Preencha todos os campos obrigatórios.';
    }

    const requiredAddress = ['cep', 'street', 'number', 'neighborhood', 'city', 'state'];
    for (const f of requiredAddress) {
        if (!address[f] || String(address[f]).trim() === '') {
            return `Endereço incompleto: campo "${f}" é obrigatório.`;
        }
    }

    return null;
};

const sanitizeAddress = (address = {}) => ({
    cep: String(address.cep || '').trim(),
    street: String(address.street || '').trim(),
    number: String(address.number || '').trim(),
    complement: String(address.complement || '').trim(),
    neighborhood: String(address.neighborhood || '').trim(),
    city: String(address.city || '').trim(),
    state: String(address.state || '').trim().toUpperCase()
});

const registerCustomer = async (req, res) => {
    try {
        const { name, email, password, birthDate, phone, address } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Preencha todos os campos obrigatórios.' });
        }

        const validationError = validateCustomerPayload({ name, birthDate, phone, address });
        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) {
            return res.status(400).json({ message: 'Já existe uma conta com este e-mail.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const rawToken = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + TOKEN_EXPIRES_HOURS * 60 * 60 * 1000);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            birthDate: new Date(birthDate),
            phone: phone.trim(),
            address: sanitizeAddress(address),
            isEmailVerified: false,
            emailVerificationToken: rawToken,
            emailVerificationExpires: expires
        });

        try {
            await sendVerificationEmail({
                to: user.email,
                name: user.name,
                verifyUrl: buildVerifyUrl(rawToken)
            });
        } catch (mailErr) {
            await User.deleteOne({ _id: user._id });
            console.error('[registerCustomer] Falha ao enviar e-mail:', mailErr.message);
            return res.status(500).json({
                message: 'Não foi possível enviar o e-mail de confirmação. Tente novamente mais tarde.'
            });
        }

        res.status(201).json({
            message: 'Cadastro recebido. Verifique seu e-mail para confirmar a conta.',
            email: user.email
        });
    } catch (error) {
        console.error('[registerCustomer] erro:', error);
        res.status(500).json({ message: 'Erro ao processar cadastro.' });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        if (!token) return res.status(400).json({ message: 'Token ausente.' });

        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Token inválido ou expirado.' });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        const jwtToken = signCustomerToken(user);
        res.json({
            message: 'E-mail confirmado com sucesso.',
            token: jwtToken,
            user: publicUser(user)
        });
    } catch (error) {
        console.error('[verifyEmail] erro:', error);
        res.status(500).json({ message: 'Erro ao verificar e-mail.' });
    }
};

const loginCustomer = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
        }

        const user = await User.findOne({ email: String(email).trim().toLowerCase() });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
        }

        if (!user.isEmailVerified) {
            return res.status(403).json({
                message: 'Você precisa confirmar seu e-mail antes de fazer login.',
                needsVerification: true
            });
        }

        const token = signCustomerToken(user);
        res.json({ token, user: publicUser(user) });
    } catch (error) {
        console.error('[loginCustomer] erro:', error);
        res.status(500).json({ message: 'Erro ao fazer login.' });
    }
};

const resendVerification = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'E-mail é obrigatório.' });

        const user = await User.findOne({ email: String(email).trim().toLowerCase() });
        if (!user) {
            return res.json({ message: 'Se este e-mail estiver cadastrado, enviaremos um novo link.' });
        }
        if (user.isEmailVerified) {
            return res.status(400).json({ message: 'Este e-mail já está confirmado.' });
        }

        const rawToken = crypto.randomBytes(32).toString('hex');
        user.emailVerificationToken = rawToken;
        user.emailVerificationExpires = new Date(Date.now() + TOKEN_EXPIRES_HOURS * 60 * 60 * 1000);
        await user.save();

        await sendVerificationEmail({
            to: user.email,
            name: user.name,
            verifyUrl: buildVerifyUrl(rawToken)
        });

        res.json({ message: 'Novo e-mail de confirmação enviado.' });
    } catch (error) {
        console.error('[resendVerification] erro:', error);
        res.status(500).json({ message: 'Erro ao reenviar e-mail.' });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -emailVerificationToken -emailVerificationExpires');
        if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
        res.json(publicUser(user));
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar perfil.' });
    }
};

const updateMe = async (req, res) => {
    try {
        if (req.user?.role !== 'customer') {
            return res.status(403).json({ message: 'Acesso permitido apenas para clientes.' });
        }

        const { name, birthDate, phone, address } = req.body;
        const validationError = validateCustomerPayload({ name, birthDate, phone, address });
        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

        user.name = String(name).trim();
        user.birthDate = new Date(birthDate);
        user.phone = String(phone).trim();
        user.address = sanitizeAddress(address);
        await user.save();

        res.json({
            message: 'Dados atualizados com sucesso.',
            user: publicUser(user)
        });
    } catch (error) {
        console.error('[updateMe] erro:', error);
        res.status(500).json({ message: 'Erro ao atualizar cadastro.' });
    }
};

module.exports = {
    registerCustomer,
    verifyEmail,
    loginCustomer,
    resendVerification,
    getMe,
    updateMe
};
