import { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } from 'discord.js';
import { generateCryptoHub } from '../../../utils/canvasCrypto.js';
import { getMarket } from '../../../utils/cryptoMarket.js';

export default {
    name: 'crypto',
    execute: async (message) => {
        await getMarket(); 

        // Agora passamos o message.author para o Canvas desenhar o Avatar!
        const buffer = await generateCryptoHub(message.author);
        const attachment = new AttachmentBuilder(buffer, { name: 'crypto_hub.png' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('crypto_market').setLabel('Ver Cotação Geral').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('crypto_wallet').setLabel('Acessar Cofre').setStyle(ButtonStyle.Secondary)
        );

        message.reply({ 
            content: `> 💡 **Comandos Rápidos:** Use \`k cc <moeda> <qtd>\` para **Comprar** e \`k vc <moeda> <qtd>\` para **Vender**!`,
            files: [attachment], 
            components: [row] 
        });
    }
};