import { processInteraction } from '../../../utils/interactionEngine.js';

export default {
    name: 'chutar',
    execute: async (message, args, client, reply, targetUser) => {
        if (!targetUser) return message.reply("Marque alguém para chutar!");

        const data = {
            name: 'chutar',
            msgs: [
                "# **Um chute ninja direto no alvo!**",
                "# **Você chutou com toda a força, nem viu passar.**",
                "# **Precisão de jogador de elite, chute certeiro!**",
                "# **Chute impactante! O alvo foi longe.**",
                "# **Aquele bico bem dado, sem dó nem piedade.**"
            ],
            gifs: [
                "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3Z3VsbzQ1d3AzbnllcDZqajFyN3NndWx2cXp1cTk1eWt4azVpcWowdyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/mFXlBOty0SxOb0ewkk/giphy.gif", "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3Ynl6ejkyMmcyMDBtMXIyNHM5MmJzODB5aGw3N3poYmtodGpudHRqeSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/ofc0lrbLlOEo2Ryucm/giphy.gif"
                
            ]
        };

        await processInteraction(message, targetUser, data);
    }
};