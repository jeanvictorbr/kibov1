import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';

export default {
    customId: 'dev_wipe', // Captura tudo que começa com dev_wipe_
    execute: async (interaction) => {
        const parts = interaction.customId.split('_');
        const phase = parts[2]; // trigger ou confirm
        const type = parts[3];    // money, kibocash, business
        const ownerId = parts[4];

        if (interaction.user.id !== ownerId) {
            return interaction.reply({ content: 'Você não tem permissão para usar este painel de desenvolvedor.', ephemeral: true });
        }

        // FASE 1: GATILHO DE CONFIRMAÇÃO (Double-Check)
        if (phase === 'trigger') {
            let targetLabel = '';
            if (type === 'money') targetLabel = 'TODO O DINHEIRO (Carteira e Banco)';
            if (type === 'kibocash') targetLabel = 'TODO O KIBOCASH';
            if (type === 'business') targetLabel = 'TODAS AS EMPRESAS DO SERVIDOR';

            const confirmEmbed = new EmbedBuilder()
                .setTitle('⚠️ OPERAÇÃO DE ALTO RISCO DETECTADA')
                .setDescription(`Você solicitou o **WIPE TOTAL** de **${targetLabel}**.\n\nIsso afetará **TODOS** os usuários cadastrados no banco de dados. Esta ação é destrutiva e não pode ser desfeita. Deseja prosseguir?`)
                .setColor('#FF0000');

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`dev_wipe_confirm_${type}_${ownerId}`).setLabel('🚨 Sim, Apagar Tudo').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId(`dev_wipe_cancel_${type}_${ownerId}`).setLabel('❌ Cancelar').setStyle(ButtonStyle.Secondary)
            );

            return interaction.update({ embeds: [confirmEmbed], components: [row] });
        }

        // SE O USUÁRIO CANCELAR
        if (phase === 'cancel') {
            return interaction.update({ content: '❌ **Operação abortada.** O banco de dados está intacto.', embeds: [], components: [] });
        }

        // FASE 2: EXECUÇÃO REAL NO PRISMA
        if (phase === 'confirm') {
            let resultadoMsg = '';

            if (type === 'money') {
                // Seta balance e bank de todo mundo para 0
                await prisma.user.updateMany({
                    data: { balance: 0, bank: 0 }
                });
                resultadoMsg = '💸 **WIPE CONCLUÍDO:** A carteira e a conta bancária de todos os usuários foram zeradas!';
            }

            if (type === 'kibocash') {
                // Seta kiboCash de todo mundo para 0
                await prisma.user.updateMany({
                    data: { kiboCash: 0 }
                });
                resultadoMsg = '💎 **WIPE CONCLUÍDO:** Todo o KiboCash em circulação foi deletado!';
            }

            if (type === 'business') {
                // Deleta todos os registros de propriedades de usuários
                await prisma.userBusiness.deleteMany({});
                resultadoMsg = '🏢 **WIPE CONCLUÍDO:** Todas as empresas privadas foram confiscadas e deletadas! O Mercado Imobiliário Oficial voltou a ficar 100% livre.';
            }

            return interaction.update({
                content: `# 🚨 BANCO DE DADOS ATUALIZADO\n${resultadoMsg}\n*Ação efetuada pelo Desenvolvedor <@${ownerId}>.*`,
                embeds: [],
                components: []
            });
        }
    }
};