import { processInteraction } from '../../../utils/interactionEngine.js';

export default {
    name: 'chutar',
    execute: async (message, args, client, reply, targetUser) => {
        if (!targetUser) return message.reply("Marque alguém para chutar!");

        const data = {
            name: 'chutar',
            msgs: [
                "Um chute ninja direto no alvo!",
                "Você chutou com toda a força, nem viu passar.",
                "Precisão de jogador de elite, chute certeiro!",
                "Chute impactante! O alvo foi longe.",
                "Aquele bico bem dado, sem dó nem piedade."
            ],
            gifs: [
                "LINK_GIF_1", "LINK_GIF_2", "LINK_GIF_3", "LINK_GIF_4", "LINK_GIF_5"
            ]
        };

        await processInteraction(message, targetUser, data);
    }
};