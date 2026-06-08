import axios from 'axios';

export async function sendDevLog(type, message) {
    const webhookUrl = process.env.WEBHOOK_LOGS_URL;
    if (!webhookUrl) return;

    try {
        await axios.post(webhookUrl, {
            content: `**[KIBO-LOG | ${type.toUpperCase()}]** \n${message}`
        });
    } catch (err) {
        console.error("Erro ao enviar log para Webhook:", err);
    }
}