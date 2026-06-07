/**
 * Cria usuário de aplicação no MongoDB e habilita autenticação.
 *
 * Uso:
 *   MONGO_APP_PASS=suasenha node backend/scripts/setupMongoAuth.js
 *
 * Ou apenas:
 *   node backend/scripts/setupMongoAuth.js
 * (o script pedirá a senha interativamente)
 */

const { MongoClient } = require('mongodb');
const readline = require('readline');

const MONGO_URI = 'mongodb://127.0.0.1:27017';
const APP_DB    = 'wilboor';
const APP_USER  = 'wilboor_user';
const MONGOD_CFG = 'C:\\Program Files\\MongoDB\\Server\\8.2\\bin\\mongod.cfg';

function ask(question) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans); }));
}

async function main() {
    const appPass = process.env.MONGO_APP_PASS || await ask('Senha para o usuário wilboor_user: ');

    if (!appPass || appPass.trim().length < 8) {
        console.error('ERRO: senha deve ter pelo menos 8 caracteres.');
        process.exit(1);
    }

    console.log('\n[1/3] Conectando ao MongoDB sem autenticação...');
    const client = new MongoClient(MONGO_URI, { serverSelectionTimeoutMS: 5000 });

    try {
        await client.connect();
        console.log('      Conexão OK.\n');

        // Criar usuário de aplicação com acesso apenas ao banco wilboor
        const appDb = client.db(APP_DB);
        console.log(`[2/3] Criando usuário "${APP_USER}" no banco "${APP_DB}"...`);
        try {
            await appDb.command({
                createUser: APP_USER,
                pwd: appPass.trim(),
                roles: [{ role: 'readWrite', db: APP_DB }]
            });
            console.log(`      Usuário "${APP_USER}" criado com sucesso.\n`);
        } catch (err) {
            if (err.codeName === 'DuplicateKey' || err.message?.includes('already exists')) {
                console.log(`      Usuário "${APP_USER}" já existe — atualizando senha...\n`);
                await appDb.command({ updateUser: APP_USER, pwd: appPass.trim() });
            } else {
                throw err;
            }
        }

        await client.close();

        // Habilitar autenticação no mongod.cfg
        console.log('[3/3] Habilitando autenticação no mongod.cfg...');
        const fs = require('fs');
        let cfg = fs.readFileSync(MONGOD_CFG, 'utf8');

        if (cfg.includes('authorization: enabled')) {
            console.log('      Autenticação já estava habilitada.\n');
        } else {
            cfg = cfg.replace(/^#security:.*$/m, 'security:\n  authorization: enabled');
            fs.writeFileSync(MONGOD_CFG, cfg, 'utf8');
            console.log('      mongod.cfg atualizado.\n');
        }

        console.log('='.repeat(60));
        console.log('PRÓXIMOS PASSOS:');
        console.log('');
        console.log('1. Reinicie o serviço MongoDB (requer permissão de admin):');
        console.log('   Restart-Service MongoDB');
        console.log('');
        console.log('2. Adicione ao backend/.env:');
        console.log(`   MONGODB_USER=${APP_USER}`);
        console.log(`   MONGODB_PASSWORD=${appPass.trim()}`);
        console.log('');
        console.log('3. Mantenha a MONGODB_URI sem credenciais (elas são injetadas');
        console.log('   automaticamente pelo server.js):');
        console.log('   MONGODB_URI=mongodb://127.0.0.1:27017/wilboor');
        console.log('='.repeat(60));

    } catch (err) {
        await client.close().catch(() => {});

        if (err.message?.includes('ECONNREFUSED') || err.name === 'MongoServerSelectionError') {
            console.error('\nERRO: não foi possível conectar ao MongoDB em', MONGO_URI);
            console.error('Verifique se o serviço MongoDB está rodando:');
            console.error('  Get-Service MongoDB');
        } else if (err.message?.includes('Unauthorized') || err.codeName === 'Unauthorized') {
            console.error('\nERRO: autenticação já está ativa no MongoDB.');
            console.error('Se você já tem um usuário configurado, apenas adicione ao .env:');
            console.error(`  MONGODB_USER=${APP_USER}`);
            console.error('  MONGODB_PASSWORD=suasenha');
        } else {
            console.error('\nErro inesperado:', err.message);
        }
        process.exit(1);
    }
}

main();
