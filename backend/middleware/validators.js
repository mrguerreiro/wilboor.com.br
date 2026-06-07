const { body, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
    }
    next();
};

const isValidCpf = (cpf) => {
    const d = String(cpf).replace(/\D/g, '');
    if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
    const calc = (end) => {
        let sum = 0;
        for (let i = 0; i < end; i++) sum += parseInt(d[i]) * (end + 1 - i);
        const rem = (sum * 10) % 11;
        return rem >= 10 ? 0 : rem;
    };
    return calc(9) === parseInt(d[9]) && calc(10) === parseInt(d[10]);
};

const registerRules = [
    body('email')
        .isEmail().withMessage('E-mail inválido.')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 }).withMessage('A senha deve ter no mínimo 8 caracteres.')
        .matches(/[A-Z]/).withMessage('A senha deve conter pelo menos uma letra maiúscula.')
        .matches(/[0-9]/).withMessage('A senha deve conter pelo menos um número.'),
    body('name')
        .trim().notEmpty().withMessage('Nome é obrigatório.')
        .isLength({ max: 100 }).withMessage('Nome muito longo.'),
    body('phone')
        .trim().notEmpty().withMessage('Telefone é obrigatório.')
        .matches(/^[\d\s()\-+]+$/).withMessage('Telefone inválido.'),
    body('birthDate')
        .isISO8601().withMessage('Data de nascimento inválida.'),
    body('cpf')
        .trim().notEmpty().withMessage('CPF é obrigatório.')
        .custom((v) => {
            if (!isValidCpf(v)) throw new Error('CPF inválido.');
            return true;
        }),
    handleValidation,
];

const loginRules = [
    body('email')
        .isEmail().withMessage('E-mail inválido.')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Senha é obrigatória.'),
    handleValidation,
];

const resendRules = [
    body('email')
        .isEmail().withMessage('E-mail inválido.')
        .normalizeEmail(),
    handleValidation,
];

const adminLoginRules = [
    body('password')
        .notEmpty().withMessage('Senha é obrigatória.')
        .isLength({ max: 200 }).withMessage('Entrada inválida.'),
    handleValidation,
];

module.exports = { registerRules, loginRules, resendRules, adminLoginRules };
