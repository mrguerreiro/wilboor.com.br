const jwt = require('jsonwebtoken');

const loginAdmin = (req, res) => {
    const receivedPassword = String(req.body?.password || '').trim();
    const adminPassword = String(process.env.ADMIN_PASSWORD || '').trim();

    if (!receivedPassword) {
        return res.status(400).json({ message: 'Senha é obrigatória' });
    }

    if (!adminPassword || !process.env.JWT_SECRET) {
        return res.status(500).json({ message: 'Configuração de autenticação ausente no servidor' });
    }

    if (receivedPassword !== adminPassword) {
        return res.status(401).json({ message: 'Senha incorreta' });
    }

    const token = jwt.sign(
        { role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
    );

    res.json({ token });
};

const validateAdmin = (req, res) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso restrito ao administrador.' });
    }

    res.json({ valid: true });
};

module.exports = { loginAdmin, validateAdmin };
