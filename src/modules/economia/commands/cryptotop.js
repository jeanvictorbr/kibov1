import { AttachmentBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { getMarket } from '../../../utils/cryptoMarket.js';
import { generateCryptoTop } from '../../../utils/canvasCrypto.js';

export default {
    name: 'cryptotop',
    aliases: ['ctop', 'topcrypto'],
    execute: async (message) => {
        const msgCarregando = await message.reply('⏳ Analisando carteiras da blockchain...');

        const market = await getMarket();
        const allWallets = await prisma.cryptoWallet.findMany();
        
        let rankings = [];

        // Calcula o patrimônio de todos os jogadores
        for (const wallet of allWallets) {
            let totalUsd = 0;
            for (const coinData of market) {
                const amount = wallet[coinData.coin] || 0;
                totalUsd += amount * coinData.price;
            }
            if (totalUsd > 0) rankings.push({ userId: wallet.userId, totalUsd });
        }

        // Organiza do mais rico para o mais pobre e pega os 5 primeiros
        rankings.sort((a, b) => b.totalUsd - a.totalUsd);
        const top5 = rankings.slice(0, 5);

        if (top5.length === 0) return msgCarregando.edit('❌ Ninguém possui criptomoedas no servidor ainda.');

        let usersData = [];
        for (const r of top5) {
            try {
                const fetchedUser = await message.client.users.fetch(r.userId);
                usersData.push({
                    username: fetchedUser.username,
                    avatar: fetchedUser.displayAvatarURL({ extension: 'png', size: 128 }),
                    total: r.totalUsd
                });
            } catch (err) {
                usersData.push({ username: 'Investidor Anônimo', avatar: 'https://i.imgur.com/3o1Kq6F.png', total: r.totalUsd });
            }
        }

        const buffer = await generateCryptoTop(usersData);
        const attachment = new AttachmentBuilder(buffer, { name: 'crypto_top.png' });

        await msgCarregando.edit({ content: null, files: [attachment] });
    }
};