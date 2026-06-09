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
                "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ3Q0MmhzdWZjMzNwaGUwMjR3aTNtNWFicGkzd3pwNHB6aHEyaXJ6ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oEjI72YdcYarva98I/giphy.gif", "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExbzE4Y3kxbzhsZHRsYWhqd2VmOTFyd3hzczZ4Yjl3aWhjbnp2dmJyaSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/QHSV5Rv8SEa1W/giphy.gif", "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExMHl2N3BqejJwNjFhZDM3dGtlZWZwc2xib2lsbHJkY204emx4cXR3ZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/XaLPBWnq4Nr3qjjpq2/giphy.gif", "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExbWllMGhmNTJhZ2gwYmxraTRyZjZqdXo4eW80cnM0djNhdXQ2ZTl4NSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26ybwSgrxiuUmwLL2/giphy.gif", "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExeHhodWlkY2MwbzJ6YTByOXAzeDVrczM5dGp0bnJmbDF1eXJ5N3dtZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3ohjUL1wb338s1pFNS/giphy.gif"
            ]
        };

        await processInteraction(message, targetUser, data);
    }
};