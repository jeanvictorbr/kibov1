import { processInteraction } from '../../../utils/interactionEngine.js';

export default {
    name: 'morder',
    execute: async (message, args, client, reply, targetUser) => {
        if (!targetUser) return message.reply("Marque alguém para morder!");

        const data = {
            name: 'morder',
            msgs: [
                "#**Cuidado, você deu uma mordida feroz!**",
                "#**Uma mordida de leve para marcar presença.**",
                "#**Você não resistiu e deu aquela abocanhada.**",
                "#**Uma mordida inesperada! O alvo ficou sem reação.**",
                "#**Cuidado com os dentes, chefe!**"
            ],
            gifs: [
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZGZrZGwycjBiZzZ4b3h6N2poeXdjNWJzaDR3eHVnZGs1enpicGdudyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/OqQOwXiCyJAmA/giphy.gif", "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZGZrZGwycjBiZzZ4b3h6N2poeXdjNWJzaDR3eHVnZGs1enpicGdudyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/LO9Y9hKLupIwko9IVd/giphy.gif", "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZGZrZGwycjBiZzZ4b3h6N2poeXdjNWJzaDR3eHVnZGs1enpicGdudyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/dSi6nSNvQh33y/giphy.gif", "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZGZrZGwycjBiZzZ4b3h6N2poeXdjNWJzaDR3eHVnZGs1enpicGdudyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/GDlw1qnt6mQS5ulGfe/giphy.gif", "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3dHpyaGNjM3luMmdvMzdwYW55MGw4OW0zdDhlc281Y3pzcXU5M3Y5dyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/X5rgYG5n4xcfgak8Ml/giphy.gif"
            ]
        };

        await processInteraction(message, targetUser, data);
    }
};