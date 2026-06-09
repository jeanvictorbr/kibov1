import { processInteraction } from '../../../utils/interactionEngine.js';

export default {
    name: 'abracar',
    execute: async (message, args, client, reply, targetUser) => {
        if (!targetUser) return message.reply("Marque alguém para abraçar!");

        const data = {
            name: 'abracar',
            msgs: [
                "Que abraço apertado! O calor humano é tudo.",
                "Você envolveu seu alvo num abraço quentinho.",
                "Aquele abraço de conforto para o dia ficar melhor.",
                "O carinho tomou conta do chat!",
                "Um abraço sincero para esquentar o clima."
            ],
            gifs: [
                "LINK_GIF_1", "LINK_GIF_2", "LINK_GIF_3", "LINK_GIF_4", "LINK_GIF_5"
            ]
        };

        await processInteraction(message, targetUser, data);
    }
};