const User = require('../models/User');

const customerProjection = '-password -emailVerificationToken -emailVerificationExpires';

const buildCustomerFilter = (search) => {
    const filter = { role: 'customer' };
    const term = String(search || '').trim();

    if (term) {
        const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        filter.$or = [
            { name: regex },
            { email: regex },
            { phone: regex },
            { cpf: regex },
            { 'address.city': regex },
            { 'address.state': regex }
        ];
    }

    return filter;
};

const getCustomers = async (req, res) => {
    try {
        if (!ensureAdmin(req, res)) return;

        const customers = await User.find(buildCustomerFilter(req.query.q))
            .select(customerProjection)
            .sort({ createdAt: -1 });

        res.json(customers);
    } catch (error) {
        console.error('[getCustomers] erro:', error);
        res.status(500).json({ message: 'Erro ao consultar clientes cadastrados.' });
    }
};

const ensureAdmin = (req, res) => {
    if (req.user?.role !== 'admin') {
        res.status(403).json({ message: 'Acesso restrito ao administrador.' });
        return false;
    }
    return true;
};

const getCustomerById = async (req, res) => {
    try {
        if (!ensureAdmin(req, res)) return;

        const customer = await User.findOne({ _id: req.params.id, role: 'customer' })
            .select(customerProjection);

        if (!customer) {
            return res.status(404).json({ message: 'Cliente não encontrado.' });
        }

        res.json(customer);
    } catch (error) {
        console.error('[getCustomerById] erro:', error);
        res.status(500).json({ message: 'Erro ao buscar dados do cliente.' });
    }
};

const deleteCustomer = async (req, res) => {
    try {
        if (!ensureAdmin(req, res)) return;

        const customer = await User.findOneAndDelete({ _id: req.params.id, role: 'customer' });
        if (!customer) {
            return res.status(404).json({ message: 'Cliente não encontrado.' });
        }

        res.json({ message: 'Cadastro do cliente excluído com sucesso.' });
    } catch (error) {
        console.error('[deleteCustomer] erro:', error);
        res.status(500).json({ message: 'Erro ao excluir cadastro do cliente.' });
    }
};

module.exports = { getCustomers, getCustomerById, deleteCustomer };
