const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const User = require('../models/User');

const email = process.argv[2];

if (!email) {
    console.error('Uso: node scripts/verifyEmail.js <email>');
    process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        const result = await User.updateOne(
            { email: email.toLowerCase() },
            {
                $set: { isEmailVerified: true },
                $unset: { emailVerificationToken: '', emailVerificationExpires: '' }
            }
        );

        if (result.matchedCount === 0) {
            console.error(`Usuário não encontrado: ${email}`);
        } else {
            console.log(`E-mail verificado com sucesso: ${email}`);
        }

        await mongoose.disconnect();
    })
    .catch(err => {
        console.error('Erro ao conectar:', err);
        process.exit(1);
    });
