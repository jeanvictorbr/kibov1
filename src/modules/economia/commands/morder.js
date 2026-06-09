import { processInteraction } from '../../../utils/interactionEngine.js';

export default {
    name: 'morder',
    execute: async (message, args, client, reply, targetUser) => {
        if (!targetUser) return message.reply("Marque alguém para morder!");

        const data = {
            name: 'morder',
            msgs: [
                "Cuidado, você deu uma mordida feroz!",
                "Uma mordida de leve para marcar presença.",
                "Você não resistiu e deu aquela abocanhada.",
                "Uma mordida inesperada! O alvo ficou sem reação.",
                "Cuidado com os dentes, chefe!"
            ],
            gifs: [
                "LINK_GIF_1", "LINK_GIF_2", "LINK_GIF_3", "LINK_GIF_4", "LINK_GIF_5"
            ]
        };

        await processInteraction(message, targetUser, data);
    }
};