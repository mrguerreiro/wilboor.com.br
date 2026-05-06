const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    images: [String],
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    department: { type: String, default: '' },
    stock: { type: Number, default: 1 },
    featured: { type: Boolean, default: false },
    weight: { type: Number, default: 0 },
    dimensions: {
        length: { type: Number, default: 0 },
        width: { type: Number, default: 0 },
        height: { type: Number, default: 0 },
    }
});

module.exports = mongoose.model('Product', productSchema);
