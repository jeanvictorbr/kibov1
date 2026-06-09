// src/modules/economia/commands/trabalhar.js
import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

export default {
    name: 'trabalhar',
    execute: async (message) => {
        const user = await prisma.user.findUnique({ where: { userId: message.author.id } });
        
        // Verifica se já tem emprego
        if (user?.currentJob !== "desempregado") {
            const diff = new Date() - new Date(user.jobStartedAt);
            const tresDias = 3 * 24 * 60 * 60 * 1000;
            const tempoRestante = tresDias - diff;
            
            if (tempoRestante > 0) {
                const horas = Math.ceil(tempoRestante / 3600000);
                return message.reply(`**Você já está empregado como ${user.currentJob.toUpperCase()}!**\nAguarde ${horas} horas para pedir demissão.`);
            }
        }

        const menu = new StringSelectMenuBuilder()
            .setCustomId(`job_select_${message.author.id}`) // Trava de ID no CustomID
            .setPlaceholder('Escolha sua carreira...')
            .addOptions([
                { label: 'Trabalho Honesto', description: 'Baixo risco, salário fixo.', value: 'onesto' },
                { label: 'Mundo do Crime', description: 'Alto risco, recompensa alta.', value: 'crime' },
                { label: 'Hacker de Elite', description: 'Risco extremo, recompensa milionária.', value: 'hacker' }
            ]);

        await message.reply({ 
            content: '# 💼 ESCOLHA SEU DESTINO\n**Escolha com sabedoria. O contrato dura 3 dias.**', 
            components: [new ActionRowBuilder().addComponents(menu)] 
        });
    }
};