import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getMarket } from '../../../utils/cryptoMarket.js';

export default {
    name: 'crypto',
    execute: async (message) => {
        // Roda a engrenagem para ver se virou a hora e o mercado precisa atualizar
        await getMarket(); 

        const embed = new EmbedBuilder()
            .setTitle('💹 KIBO EXCHANGE')
            .setDescription('Bem-vindo à maior corretora da Deep Web.\nO mercado sofre alterações a cada **1 HORA** real. Compre na baixa, venda na alta e fique trilionário... ou perca tudo tentando.\n\n👇 **Acesse os dados pelo painel:**')
            .setColor('#F3BA2F')
            .setImage('https://i.imgur.com/K3U4P6B.png'); // Banner bonitão de crypto

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('crypto_market').setLabel('📊 Ver Mercado').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('crypto_wallet').setLabel('💼 Minha Carteira').setStyle(ButtonStyle.Secondary)
        );

        message.reply({ embeds: [embed], components: [row] });
    }
};