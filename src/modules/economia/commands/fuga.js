import { prisma } from '../../../core/database.js';

export default {
    name: 'fuga',
    execute: async (message) => {
        const userId = message.author.id;

        // 1. Verifica se ele realmente tá preso
        const jailCooldown = await prisma.cooldown.findUnique({
            where: { userId_command: { userId, command: 'preso' } }
        });

        if (!jailCooldown || jailCooldown.expiresAt < new Date()) {
            return message.reply('🕊️ Tá chapando, truta? Você tá livre na rua. Vai fugir de quem? Dos seus pensamentos?');
        }

        // 2. Verifica se ele já tentou fugir agora pouco e tá cansado (10 minutos)
        const exhaustCooldown = await prisma.cooldown.findUnique({
            where: { userId_command: { userId, command: 'cansaco_fuga' } }
        });

        if (exhaustCooldown && exhaustCooldown.expiresAt > new Date()) {
            const minutos = Math.ceil((exhaustCooldown.expiresAt - new Date()) / 60000);
            return message.reply(`🥵 Seus braços tão doendo de tanto serrar a grade. Fica pianinho na cela por mais **${minutos} minutos** antes de tentar outra fuga, senão o guarda te pega.`);
        }

        // --- ROLETA DA FUGA (30% de chance de sucesso) ---
        const chance = Math.random() * 100;

        if (chance <= 30) {
            // SUCESSO: Ele fugiu! (Apaga o cooldown da prisão)
            await prisma.cooldown.delete({
                where: { userId_command: { userId, command: 'preso' } }
            });

            return message.reply(`🥷 **FUGA DE CINEMA!**\n\nVocê aproveitou a troca de guarda, passou vaselina no corpo, escorregou pela grade e pulou o muro de Alcatraz!\n\n🔓 **Você tá livre nas ruas de novo! Vai pra toca.**`);
            
        } else {
            // FALHA: Pego no pulo! (+15 min de pena e 10 min de exaustão)
            
            const novaPena = new Date(jailCooldown.expiresAt.getTime() + 15 * 60 * 1000); 
            const cansacoTime = new Date(Date.now() + 10 * 60 * 1000); 

            await prisma.$transaction([
                // Aumenta a pena da prisão
                prisma.cooldown.update({
                    where: { userId_command: { userId, command: 'preso' } },
                    data: { expiresAt: novaPena }
                }),
                // Aplica o cansaço
                prisma.cooldown.upsert({
                    where: { userId_command: { userId, command: 'cansaco_fuga' } },
                    update: { expiresAt: cansacoTime },
                    create: { userId, command: 'cansaco_fuga', expiresAt: cansacoTime }
                })
            ]);

            return message.reply(`🚨 **A CASA CAIU!**\n\nVocê tava com metade do corpo pra fora da janela quando a lanterna do carcereiro bateu na sua cara. Tomou duas borrachadas no lombo e voltou pra cela!\n\n⚖️ **Punição:** O juiz te deu mais **+15 Minutos** de pena por tentativa de fuga! (E você tá exausto por 10 minutos).`);
        }
    }
};