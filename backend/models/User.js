const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    cep: { type: String, trim: true },
    street: { type: String, trim: true },
    number: { type: String, trim: true },
    complement: { type: String, trim: true },
    neighborhood: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true }
}, { _id: false });

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, default: 'customer' },

    birthDate: { type: Date },
    phone: { type: String, trim: true },
    address: { type: addressSchema, default: () => ({}) },

    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
