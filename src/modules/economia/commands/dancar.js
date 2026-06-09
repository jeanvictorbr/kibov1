import { processInteraction } from '../../../utils/interactionEngine.js';

export default {
    name: 'dancar',
    execute: async (message, args, client, reply, targetUser) => {
        if (!targetUser) return message.reply("Marque alguém para dançar!");

        const data = {
            name: 'dancar',
            msgs: [
                "#**Que passinho de qualidade!**",
                "#**Você botou todo mundo para dançar agora.**",
                "#**Ritmo alucinante, ninguém para essa dupla!**",
                "#**Vamos cair na pista com estilo!**",
                "#**Passinho sincronizado, nota 10!**"
            ],
            gifs: [
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYjVxMG5uZDFnMTVyb2llbTJtYm1oYnFrdjI4ZXd5M3o3eDMxdGpkcCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/V7jkATiqn3mRie2LI2/giphy.gif", "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYjVxMG5uZDFnMTVyb2llbTJtYm1oYnFrdjI4ZXd5M3o3eDMxdGpkcCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/V7jkATiqn3mRie2LI2/giphy.gif", "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYjVxMG5uZDFnMTVyb2llbTJtYm1oYnFrdjI4ZXd5M3o3eDMxdGpkcCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/1jacd4JEUM03KcdORi/giphy.gif", "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYjVxMG5uZDFnMTVyb2llbTJtYm1oYnFrdjI4ZXd5M3o3eDMxdGpkcCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/Xw6yFn7frR3Y4/giphy.gif", "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3bmR5NWp5YWdlOG93cm5wYWI0d3Vqb2wybGdjNm9rcWFuamc4eTZ3cyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/13JipyoTNNvM2c/giphy.gif"
            ]
        };

        await processInteraction(message, targetUser, data);
    }
};