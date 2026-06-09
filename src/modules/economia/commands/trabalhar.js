import { prisma } from '../../../core/database.js'; // ISSO É O QUE FALTA
import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

export default {
    name: 'trabalhar',
    execute: async (message) => {
        // Agora o 'prisma' está definido graças ao import acima
        const user = await prisma.user.findUnique({ where: { userId: message.author.id } });
        
        if (user?.currentJob !== "desempregado" && user?.currentJob !== null) {
            // Lógica de tempo para mudar
            const diff = new Date() - new Date(user.jobStartedAt);
            const tresDias = 3 * 24 * 60 * 60 * 1000;
            
            if (diff < tresDias) {
                const horas = Math.ceil((tresDias - diff) / 3600000);
                return message.reply(`**Você já é um ${user.currentJob.toUpperCase()}!**\nAguarde ${horas} horas para pedir demissão.`);
            }
        }

        const menu = new StringSelectMenuBuilder()
            .setCustomId(`job_select_${message.author.id}`) 
            .setPlaceholder('Escolha sua carreira...')
            .addOptions([
                { label: 'Trabalho Honesto', description: 'Ganhos fixos, risco zero.', value: 'onesto' },
                { label: 'Mundo do Crime', description: 'Alto risco, recompensa alta.', value: 'crime' },
                { label: 'Hacker de Elite', description: 'Risco extremo, recompensa milionária.', value: 'hacker' }
            ]);

        await message.reply({ 
            content: '# 💼 ESCOLHA SEU DESTINO\n**O contrato dura 3 dias. Escolha com sabedoria.**', 
            components: [new ActionRowBuilder().addComponents(menu)] 
        });
    }
};