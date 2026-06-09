import { processInteraction } from '../../../utils/interactionEngine.js';

export default {
    name: 'socar', // O loader vai carregar como 'socar' (ksocar)
    execute: async (message, args, client, reply, targetUser) => {
        if (!targetUser) return message.reply("Marque alguém para socar!");

        const data = {
            name: 'socar',
            msgs: [
                "#**Soco preciso! A precisão do seu golpe foi recompensada.**",
                "#**Você acertou um direto na cara!**",
                "#**Que socaço! O impacto foi gigante.**",
                "#**Golpe de mestre!**",
                "#**Você não deu chance para o oponente.**"
            ],
            gifs: [
                "LINK_GIF_1", "LINK_GIF_2", "LINK_GIF_3", "LINK_GIF_4", "LINK_GIF_5"
            ]
        };

        await processInteraction(message, targetUser, data);
    }
};