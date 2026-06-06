const nodemailer = require('nodemailer');

let cachedTransporter = null;

const cleanEnv = (value) => String(value || '').trim();

const getSecureMode = (port) => {
    if (process.env.SMTP_SECURE !== undefined) {
        return cleanEnv(process.env.SMTP_SECURE).toLowerCase() === 'true';
    }
    return Number(port) === 465;
};

const getTransporter = () => {
    if (cachedTransporter) return cachedTransporter;

    const SMTP_HOST = cleanEnv(process.env.SMTP_HOST);
    const SMTP_PORT = Number(cleanEnv(process.env.SMTP_PORT));
    const SMTP_USER = cleanEnv(process.env.SMTP_USER);
    const SMTP_PASS = cleanEnv(process.env.SMTP_PASS);

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
        throw new Error('Configuração SMTP ausente. Defina SMTP_HOST, SMTP_PORT, SMTP_USER e SMTP_PASS no .env');
    }

    const secure = getSecureMode(SMTP_PORT);

    cachedTransporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
        requireTLS: !secure,
        connectionTimeout: 30000,
        greetingTimeout: 30000,
        socketTimeout: 30000,
        logger: cleanEnv(process.env.SMTP_DEBUG).toLowerCase() === 'true',
        debug: cleanEnv(process.env.SMTP_DEBUG).toLowerCase() === 'true',
        tls: {
            servername: SMTP_HOST,
            rejectUnauthorized: cleanEnv(process.env.SMTP_REJECT_UNAUTHORIZED).toLowerCase() === 'true'
        }
    });

    return cachedTransporter;
};

const verifySmtpConnection = async () => {
    const transporter = getTransporter();
    await transporter.verify();
};

const sendEmail = async ({ to, subject, html, text }) => {
    const transporter = getTransporter();
    const smtpUser = cleanEnv(process.env.SMTP_USER);
    const from = cleanEnv(process.env.MAIL_FROM) || `"Wilboor.com" <${smtpUser}>`;
    const recipient = cleanEnv(to);
    const bcc = cleanEnv(process.env.MAIL_BCC_CONFIRMATIONS);

    const info = await transporter.sendMail({
        from,
        sender: smtpUser,
        replyTo: smtpUser,
        envelope: {
            from: smtpUser,
            to: bcc ? [recipient, bcc] : recipient
        },
        to: recipient,
        bcc: bcc || undefined,
        subject,
        html,
        text,
    });

    const accepted = info.accepted || [];
    const rejected = info.rejected || [];

    console.log('[mailer] E-mail enviado:', {
        messageId: info.messageId,
        accepted,
        rejected,
        response: info.response
    });

    if (!accepted.includes(recipient)) {
        throw new Error(`Servidor SMTP não aceitou o destinatário ${recipient}. Rejeitados: ${rejected.join(', ') || 'nenhum'}`);
    }

    return info;
};

const sendVerificationEmail = async ({ to, name, verifyUrl }) => {
    const transporter = getTransporter();
    const smtpUser = cleanEnv(process.env.SMTP_USER);
    const from = cleanEnv(process.env.MAIL_FROM) || `"Wilboor.com" <${smtpUser}>`;
    const recipient = cleanEnv(to);
    const bcc = cleanEnv(process.env.MAIL_BCC_CONFIRMATIONS);

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #222;">
            <h2 style="color: #d39e00;">Bem-vindo(a) à Wilboor, ${name}!</h2>
            <p>Obrigado por se cadastrar. Para concluir seu cadastro, confirme seu e-mail clicando no botão abaixo:</p>
            <p style="text-align: center; margin: 28px 0;">
                <a href="${verifyUrl}"
                   style="background: #ffc107; color: #222; padding: 12px 28px; border-radius: 6px;
                          text-decoration: none; font-weight: bold; display: inline-block;">
                    Confirmar meu e-mail
                </a>
            </p>
            <p>Se o botão não funcionar, copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all; color: #555;">${verifyUrl}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
            <small style="color: #888;">Se você não solicitou este cadastro, basta ignorar este e-mail.</small>
        </div>
    `;

    const info = await transporter.sendMail({
        from,
        sender: smtpUser,
        replyTo: smtpUser,
        envelope: {
            from: smtpUser,
            to: bcc ? [recipient, bcc] : recipient
        },
        to: recipient,
        bcc: bcc || undefined,
        subject: 'Confirme seu e-mail - Wilboor',
        headers: {
            'X-Wilboor-Mail-Type': 'customer-email-verification'
        },
        html,
        text: `Olá ${name}, confirme seu e-mail acessando: ${verifyUrl}`
    });

    const accepted = info.accepted || [];
    const rejected = info.rejected || [];

    console.log('[mailer] E-mail de verificação enviado:', {
        messageId: info.messageId,
        accepted,
        rejected,
        response: info.response
    });

    if (!accepted.includes(recipient)) {
        throw new Error(`Servidor SMTP não aceitou o destinatário ${recipient}. Rejeitados: ${rejected.join(', ') || 'nenhum'}`);
    }

    return info;
};

module.exports = { sendVerificationEmail, sendEmail, verifySmtpConnection };

