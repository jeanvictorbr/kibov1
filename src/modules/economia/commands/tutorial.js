import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

export default {
    name: 'tutorial',
    execute: async (message) => {
        const menu = new StringSelectMenuBuilder()
            .setCustomId('tut_nav')
            .setPlaceholder('Abre o manual da quebrada...')
            .addOptions([
                { label: 'O Básico (Economia & Banco)', description: 'Como não ser roubado e guardar sua grana.', value: 'banco', emoji: '💰' },
                { label: 'Bolsa Kibo Exchange (Crypto)', description: 'Day trade, moedas de elite, gráficos e Kibo News.', value: 'crypto', emoji: '💹' }, // ← NOVO ADICIONADO AQUI
                { label: 'Trampos de Rua (k executar)', description: 'Como funcionam os empregos e os riscos.', value: 'trampos', emoji: '🏢' },
                { label: 'A Vida do Crime (Ladrão)', description: 'Assalto pesadão, Alcatraz, Fuga e Suborno.', value: 'crime', emoji: '🥷' },
                { label: 'A Lei e a Ordem (Polícia)', description: 'Como dar o enquadro e prender vagabundo.', value: 'policia', emoji: '🚓' },
                { label: 'Cassino Clandestino', description: 'Tigrinho, Crash, Mines e Coinflip.', value: 'cassino', emoji: '🎰' },
                { label: 'Mercado e Empresas', description: 'Como gerar dinheiro enquanto dorme.', value: 'lojas', emoji: '🛒' },
                { label: 'Respeito na Rua (Social)', description: 'Habilidades, Perfil e ações com os manos.', value: 'social', emoji: '🫂' },
                { label: 'Vantagens do VIP', description: 'Privilégios de quem banca o morro.', value: 'vip', emoji: '💎' },
            ]);

        const row = new ActionRowBuilder().addComponents(menu);

        const texto = `📚 **MANUAL DE SOBREVIVÊNCIA DO KIBO**\n\nVisão, rapaziada! Tá pisando na cidade agora e não quer ser passado pra trás? Presta atenção nas regras do jogo. Aqui tem tudo que você precisa saber sobre o dinheiro, o crime, a lei e o mercado financeiro.\n\n👇 **Abre o menu aí embaixo e estuda o sistema!**`;

        await message.reply({ content: texto, components: [row] });
    }
};