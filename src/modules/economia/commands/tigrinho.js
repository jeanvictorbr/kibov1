import { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { generateSlotCanvas } from '../../../utils/canvasTigrinho.js';

export default {
    name: 'tigrinho',
    execute: async (message) => {
        const userId = message.author.id;
        const initialBet = 1000;

        // Grid visual falso só para a tela inicial da máquina
        const initialGrid = [
            ['TIGRE', 'DIMA', 'TIGRE'],
            ['CEREJA', 'SINO', 'LIMÃO'],
            ['UVA', 'CEREJA', 'DIMA']
        ];

        // Gera a imagem inicial
        const buffer = await generateSlotCanvas(initialGrid, initialBet, 0, false);
        const attachment = new AttachmentBuilder(buffer, { name: 'slot.png' });

        // Cria os botões da máquina (Passando a aposta atual no CustomId)
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`tig_action_down_${initialBet}_${userId}`).setLabel('➖ Diminuir').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`tig_action_spin_${initialBet}_${userId}`).setLabel('🎰 GIRAR').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`tig_action_up_${initialBet}_${userId}`).setLabel('➕ Aumentar').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`tig_action_exit_0_${userId}`).setLabel('🏃 Sair').setStyle(ButtonStyle.Danger)
        );

        await message.reply({ 
            content: '🎰 **MÁQUINA DO TIGRINHO**\nAjuste sua aposta e clique em **GIRAR**! (Ganha com 3 símbolos iguais na horizontal ou diagonal)', 
            files: [attachment], 
            components: [row] 
        });
    }
};