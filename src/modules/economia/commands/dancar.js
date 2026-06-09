import { processInteraction } from '../../../utils/interactionEngine.js';

export default {
    name: 'dancar',
    execute: async (message, args, client, reply, targetUser) => {
        if (!targetUser) return message.reply("Marque alguém para dançar!");

        const data = {
            name: 'dancar',
            msgs: [
                "Que passinho de qualidade!",
                "Você botou todo mundo para dançar agora.",
                "Ritmo alucinante, ninguém para essa dupla!",
                "Vamos cair na pista com estilo!",
                "Passinho sincronizado, nota 10!"
            ],
            gifs: [
                "LINK_GIF_1", "LINK_GIF_2", "LINK_GIF_3", "LINK_GIF_4", "LINK_GIF_5"
            ]
        };

        await processInteraction(message, targetUser, data);
    }
};