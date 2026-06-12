const { BrevoClient } = require('@getbrevo/brevo');

const cleanEnv = (value) => String(value || '').trim();

// Parseia "Nome <email>" ou retorna { email } se não houver nome
const parseSender = (mailFrom, fallbackEmail) => {
    const raw = cleanEnv(mailFrom) || `"Wilboor.com" <${fallbackEmail}>`;
    const match = raw.match(/^"?([^"<]+)"?\s*<([^>]+)>$/);
    if (match) return { name: match[1].trim(), email: match[2].trim() };
    return { email: raw };
};

const getClient = () => {
    const apiKey = cleanEnv(process.env.BREVO_API_KEY);
    if (!apiKey) throw new Error('BREVO_API_KEY não definida no .env');
    return new BrevoClient({ apiKey });
};

const verifySmtpConnection = async () => {
    const client = getClient();
    await client.account.getAccount();
};

const sendEmail = async ({ to, subject, html, text }) => {
    const client = getClient();
    const sender = parseSender(process.env.MAIL_FROM, process.env.SMTP_USER);
    const recipient = cleanEnv(to);
    const bcc = cleanEnv(process.env.MAIL_BCC_CONFIRMATIONS);

    const body = {
        sender,
        to: [{ email: recipient }],
        subject,
        htmlContent: html,
        ...(text && { textContent: text }),
        ...(bcc && { bcc: [{ email: bcc }] }),
    };

    const info = await client.transactionalEmails.sendTransacEmail(body);

    console.log('[mailer] E-mail enviado:', {
        messageId: info.messageId,
        to: recipient,
    });

    return info;
};

const sendVerificationEmail = async ({ to, name, verifyUrl }) => {
    const client = getClient();
    const sender = parseSender(process.env.MAIL_FROM, process.env.SMTP_USER);
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

    const body = {
        sender,
        to: [{ email: recipient }],
        subject: 'Confirme seu e-mail - Wilboor',
        htmlContent: html,
        textContent: `Olá ${name}, confirme seu e-mail acessando: ${verifyUrl}`,
        headers: { 'X-Wilboor-Mail-Type': 'customer-email-verification' },
        ...(bcc && { bcc: [{ email: bcc }] }),
    };

    const info = await client.transactionalEmails.sendTransacEmail(body);

    console.log('[mailer] E-mail de verificação enviado:', {
        messageId: info.messageId,
        to: recipient,
    });

    return info;
};

module.exports = { sendVerificationEmail, sendEmail, verifySmtpConnection };
