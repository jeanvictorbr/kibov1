import { WebhookClient } from 'discord.js';

export async function sendWebhookResponse(channel, wlName, wlAvatar, wlWebhookUrl, embed) {
    if (!wlWebhookUrl) return channel.send({ embeds: [embed] });

    try {
        const webhookClient = new WebhookClient({ url: wlWebhookUrl });
        await webhookClient.send({
            username: wlName || 'Kibo',
            avatarURL: wlAvatar || null,
            embeds: [embed]
        });
    } catch (error) {
        console.error("Erro ao usar Webhook de WhiteLabel:", error);
        // Fallback: se o webhook falhar, responde normal no canal
        await channel.send({ embeds: [embed] });
    }
}