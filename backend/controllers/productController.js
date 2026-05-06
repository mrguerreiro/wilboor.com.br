const Product = require('../models/Product');

const createProduct = async (req, res) => {
    const { code, name, description, price, images, categories, department, stock, featured, weight, dimensions } = req.body;
    if (!code || !name || !description || price === undefined) {
        return res.status(400).json({ message: 'Código, nome, descrição e preço são obrigatórios' });
    }
    try {
        const product = new Product({ code, name, description, price, images, categories, department, stock, featured, weight, dimensions });
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: `O código "${code}" já está em uso por outro produto.` });
        }
        res.status(400).json({ error: error.message });
    }
};

const getProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('categories');
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { code, ...updateData } = req.body;
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        if (!product) return res.status(404).json({ message: 'Produto não encontrado' });
        res.json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: 'Produto não encontrado' });
        res.json({ message: 'Produto deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createProduct, getProducts, updateProduct, deleteProduct };
