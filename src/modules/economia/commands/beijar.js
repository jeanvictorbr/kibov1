import { processInteraction } from '../../../utils/interactionEngine.js';

export default {
    name: 'abracar',
    execute: async (message, args, client, reply, targetUser) => {
        if (!targetUser) return message.reply("Marque alguém para abraçar!");

        const data = {
            name: 'abracar',
            msgs: [
                "#**Que abraço apertado! O calor humano é tudo.**",
                "#**Você envolveu seu alvo num abraço quentinho.**",
                "#**Aquele abraço de conforto para o dia ficar melhor.**",
                "#**O carinho tomou conta do chat!**",
                "#**Um abraço sincero para esquentar o clima.**"
            ],
            gifs: [
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzdwcWZkeWFqN2FnYmppNzFxOHk5b3V3MDExNXc0djFudXBlZWc3biZlcD12MV9naWZzX3NlYXJjaCZjdD1n/vGui2cVNUAqti/giphy.gif", "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzdwcWZkeWFqN2FnYmppNzFxOHk5b3V3MDExNXc0djFudXBlZWc3biZlcD12MV9naWZzX3NlYXJjaCZjdD1n/l1BgRosJTTs7i7TQ4/giphy.gif", "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzdwcWZkeWFqN2FnYmppNzFxOHk5b3V3MDExNXc0djFudXBlZWc3biZlcD12MV9naWZzX3NlYXJjaCZjdD1n/BODYd97UpZ4Fq/giphy.gif", "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzdwcWZkeWFqN2FnYmppNzFxOHk5b3V3MDExNXc0djFudXBlZWc3biZlcD12MV9naWZzX3NlYXJjaCZjdD1n/fWFeUD6s0Y90Y/giphy.gif", "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzdwcWZkeWFqN2FnYmppNzFxOHk5b3V3MDExNXc0djFudXBlZWc3biZlcD12MV9naWZzX3NlYXJjaCZjdD1n/idvFCtYeBQjGud3Bfr/giphy.gif"
            ]
        };

        await processInteraction(message, targetUser, data);
    }
};