import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
    customId: 'crypto_tutorial',
    execute: async (interaction) => {
        // ==========================================
        // 🔒 FECHADURA BIOMÉTRICA
        // ==========================================
        try {
            const originalMsg = await interaction.channel.messages.fetch(interaction.message.reference.messageId);
            if (interaction.user.id !== originalMsg.author.id) {
                return interaction.reply({ content: '🛑 **ACESSO NEGADO!** Esse terminal pertence a outro investidor.', ephemeral: true });
            }
        } catch (err) {
            return interaction.reply({ content: '❌ **Erro de Sessão.**', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle('📘 MANUAL DA KIBO EXCHANGE')
            .setDescription('Guia definitivo de operações e sobrevivência no mercado financeiro da Kibo Engine.')
            .setColor('#00F2FE')
            .addFields(
                {
                    name: '🕒 A Dinâmica do Mercado',
                    value: '• O mercado global sofre oscilações automáticas a cada **10 minutos**.\n• Moedas comuns (como KBC) variam pouco. Já as MemeCoins (SHBK/DGK) podem explodir ou derreter até **45%** em uma única virada de hora!'
                },
                {
                    name: '💸 Como Lucrar & Taxas (Gas Fee)',
                    value: '• Regra de ouro: Compre na baixa e venda na alta.\n• A corretora cobra uma taxa de rede (Gas Fee) de **2%** por operação.\n• O gráfico calcula automaticamente seu **Preço Médio** e exibe seu lucro ou prejuízo real em porcentagem!'
                },
                {
                    name: '📰 O Segredo: Kibo News',
                    value: '• O botão de Notícias revela manchetes cyberpunk exclusivas geradas em tempo real.\n• Elas ajudam a entender o comportamento e a tendência dos ativos no servidor.'
                },
                {
                    name: '⌨️ Terminal de Comandos (Day Trade Veloz)',
                    value: '• **Comprar:** `k cc <moeda> <qtd>` (Ex: `k cc BTK 10`)\n• **Vender:** `k vc <moeda> <qtd|tudo>` (Ex: `k vc BTK tudo`)\n• **Ranking:** `k cryptotop`'
                }
            )
            .setFooter({ text: 'Kibo Exchange • Sistema Financeiro Oficial' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('crypto_voltar').setLabel('🔙 Voltar ao Hub').setStyle(ButtonStyle.Danger)
        );

        // O 'files: []' garante que a imagem anterior suma e dê lugar ao Embed limpo
        await interaction.update({ embeds: [embed], files: [], components: [row] });
    }
};