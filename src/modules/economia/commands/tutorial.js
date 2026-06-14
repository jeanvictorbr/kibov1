import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

export default {
    name: 'tutorial',
    execute: async (message) => {
        const menu = new StringSelectMenuBuilder()
            .setCustomId('tut_nav')
            .setPlaceholder('Escolhe o manual aí, chefe...')
            .addOptions([
                { label: 'Economia & Banco', description: 'Como guardar grana, fazer Pix e ver o Top.', value: 'banco', emoji: '💰' },
                { label: 'Empregos & Trampos', description: 'Profissões, Cidadão, Hacker, PM.', value: 'trampos', emoji: '🏢' },
                { label: 'Guerra de Rua (Polícia x Ladrão)', description: 'Assaltos, Fuga, Prisão e Suborno.', value: 'guerra', emoji: '🔫' },
                { label: 'Cassino Clandestino', description: 'Tigrinho, Crash, Mines, Coinflip e Airdrop.', value: 'cassino', emoji: '🎰' },
                { label: 'Lojas & Empresas', description: 'Mercado Negro, Compras e Renda Passiva.', value: 'lojas', emoji: '🛒' },
                { label: 'Perfil & Social', description: 'Skills, Bio e Interações com os manos.', value: 'social', emoji: '🫂' },
                { label: 'Vantagens VIP', description: 'Privilégios de quem banca o servidor.', value: 'vip', emoji: '💎' },
            ]);

        const row = new ActionRowBuilder().addComponents(menu);

        const texto = `📚 **MANUAL DE SOBREVIVÊNCIA DO KIBO**\n\nVisão, rapaziada! Tá perdido na cidade e não sabe como fazer dinheiro ou como os sistemas funcionam? Aqui é o guia completo pra você não ser passado pra trás.\n\n👇 **Abre o menu aí embaixo e escolhe qual fita você quer aprender!**`;

        await message.reply({ content: texto, components: [row] });
    }
};