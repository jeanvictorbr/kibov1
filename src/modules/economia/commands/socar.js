import { processInteraction } from '../../../utils/interactionEngine.js';

export default {
    name: 'socar', // O loader vai carregar como 'socar' (ksocar)
    execute: async (message, args, client, reply, targetUser) => {
        if (!targetUser) return message.reply("Marque alguém para socar!");

        const data = {
            name: 'socar',
            msgs: [
                "# **Soco preciso! A precisão do seu golpe foi recompensada.**",
                "# **Você acertou um direto na cara!**",
                "# **Que socaço! O impacto foi gigante.**",
                "# **Golpe de mestre!**",
                "# **Você não deu chance para o oponente.**"
            ],
            gifs: [
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbHJvdzQydWY2M3ZudnRxNWZlNGV4MjBhZzYzNTI5d24ybW5yeTFwZSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/mTvNxOkKvJ9FoFl6iZ/giphy.gif", "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbHJvdzQydWY2M3ZudnRxNWZlNGV4MjBhZzYzNTI5d24ybW5yeTFwZSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/eFpnEraotSx3Aj3zoq/giphy.gif", "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbHJvdzQydWY2M3ZudnRxNWZlNGV4MjBhZzYzNTI5d24ybW5yeTFwZSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/998oyT9xN3pBLgCrm6/giphy.gif", "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbHJvdzQydWY2M3ZudnRxNWZlNGV4MjBhZzYzNTI5d24ybW5yeTFwZSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/cL7PRkWRwTBGy9UKlu/giphy.gif", "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3djJkNDR1Z2NlY2xpZmdycnF0dnFtenBibnNiMjhsajMwc3MzYjA3NCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/Au6hYuHy0WONwqOxj5/giphy.gif"
            ]
        };

        await processInteraction(message, targetUser, data);
    }
};