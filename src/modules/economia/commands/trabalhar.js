// src/modules/economia/commands/trabalhar.js
import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

export default {
    name: 'trabalhar',
    execute: async (message) => {
        const menu = new StringSelectMenuBuilder()
            .setCustomId('job_select')
            .setPlaceholder('Escolha sua carreira...')
            .addOptions([
                { label: 'Trabalho Onesto', description: 'Ganhos baixos, 0% risco, 100% legal.', value: 'onesto' },
                { label: 'Mundo do Crime', description: 'Ganhos altos, 50% chance de ser pego.', value: 'crime' },
                { label: 'Hacker de Elite', description: 'Ganhos absurdos, 80% chance de prisão.', value: 'hacker' }
            ]);

        await message.reply({ 
            content: '# 💼 ESCOLHA SEU DESTINO\n**Ao mudar de emprego, você fica preso nele por 3 dias!**', 
            components: [new ActionRowBuilder().addComponents(menu)] 
        });
    }
};