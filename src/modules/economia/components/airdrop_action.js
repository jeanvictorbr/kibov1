import { MessageFlags } from 'discord.js';

export default {
    customId: 'airdrop_action',
    execute: async (interaction) => {
        const parts = interaction.customId.split('_');
        const action = parts[2]; // 'claim'
        const airdropId = parts[3];

        if (action !== 'claim') return;

        // Puxa a memória global para ver se o Airdrop ainda está rolando
        const airdropData = global.activeAirdrops?.get(airdropId);

        if (!airdropData) {
            return interaction.reply({ content: '❌ Este Airdrop já encerrou ou evaporou!', flags: [MessageFlags.Ephemeral] });
        }

        // Regra 1: O dono não pega o próprio airdrop
        if (interaction.user.id === airdropData.hostId) {
            return interaction.reply({ content: '✋ Tira a mão! Tu não podes apanhar a tua própria Chuva de PIX, chefe.', flags: [MessageFlags.Ephemeral] });
        }

        // Regra 2: Só pode pegar uma vez
        if (airdropData.claimers.has(interaction.user.id)) {
            return interaction.reply({ content: '✅ Calma aí! Tu já garantiste a tua parte. Aguarda o fim do tempo.', flags: [MessageFlags.Ephemeral] });
        }

        // Registra o ganho!
        airdropData.claimers.add(interaction.user.id);
        return interaction.reply({ content: '🎉 **Conseguiste apanhar parte da grana!**\nAguarda os 60 segundos terminarem para o dinheiro cair na tua carteira.', flags: [MessageFlags.Ephemeral] });
    }
};