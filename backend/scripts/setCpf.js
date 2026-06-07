/**
 * Lista clientes sem CPF e permite preencher interativamente.
 *
 * Uso:
 *   node backend/scripts/setCpf.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { MongoClient, ObjectId } = require('mongodb');
const readline = require('readline');

const _base = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wilboor';
const _db   = _base.split('/').pop().split('?')[0];
const mongoUri = (process.env.MONGODB_USER && process.env.MONGODB_PASSWORD)
    ? `mongodb://${encodeURIComponent(process.env.MONGODB_USER)}:${encodeURIComponent(process.env.MONGODB_PASSWORD)}@${_base.replace(/^mongodb:\/\//, '')}?authSource=${_db}`
    : _base;

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(resolve => rl.question(q, resolve));

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

async function main() {
    const client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 5000 });

    try {
        await client.connect();
        const col = client.db(_db).collection('users');

        const users = await col.find(
            { role: 'customer', $or: [{ cpf: { $exists: false } }, { cpf: '' }, { cpf: null }] },
            { projection: { name: 1, email: 1, cpf: 1 } }
        ).toArray();

        if (users.length === 0) {
            console.log('\nTodos os clientes já têm CPF cadastrado.');
            return;
        }

        console.log(`\nEncontrado(s) ${users.length} cliente(s) sem CPF:\n`);

        for (const user of users) {
            console.log(`  Nome:  ${user.name}`);
            console.log(`  Email: ${user.email}`);

            let cpfDigits = '';
            while (true) {
                const input = await ask('  CPF (somente números ou 000.000.000-00, Enter para pular): ');
                if (!input.trim()) {
                    console.log('  -> Pulado.\n');
                    break;
                }
                if (!isValidCpf(input)) {
                    console.log('  CPF inválido. Tente novamente.');
                    continue;
                }
                cpfDigits = input.replace(/\D/g, '');
                await col.updateOne({ _id: user._id }, { $set: { cpf: cpfDigits } });
                console.log(`  -> CPF ${cpfDigits} salvo com sucesso.\n`);
                break;
            }
        }

        console.log('Concluído.');
    } catch (err) {
        console.error('Erro:', err.message);
        process.exit(1);
    } finally {
        rl.close();
        await client.close();
    }
}

main();
