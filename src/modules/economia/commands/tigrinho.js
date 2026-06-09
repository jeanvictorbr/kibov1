import { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { generateSlotCanvas } from '../../../utils/canvasTigrinho.js';

export default {
    name: 'tigrinho',
    execute: async (message) => {
        const userId = message.author.id;
        const initialBet = 1000;

        // Grid visual falso só para a tela inicial da máquina (Usando chaves: 'tiger', 'diamond', etc.)
        const initialGridKeys = [
            ['tiger', 'diamond', 'grape'],
            ['cherry', 'bell', 'cherry'],
            ['grape', 'tiger', 'diamond']
        ];

        // Manda o aviso de carregamento enquanto o Canvas puxa as imagens do CDN
        const msgLoading = await message.reply('🎰 **KIBO SLOTS** • Preparando a máquina e carregando os emotes coloridos...');

        try {
            // Gera a imagem inicial com emotes HD
            const buffer = await generateSlotCanvas(initialGridKeys, initialBet, 0);
            const attachment = new AttachmentBuilder(buffer, { name: 'kibo_slot.png' });

            // Botões
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`tig_action_down_${initialBet}_${userId}`).setLabel('➖').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId(`tig_action_spin_${initialBet}_${userId}`).setLabel(`🎰 GIRAR ($${initialBet})`).setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId(`tig_action_up_${initialBet}_${userId}`).setLabel('➕').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId(`tig_action_exit_0_${userId}`).setLabel('🏃 Sair').setStyle(ButtonStyle.Danger)
            );

            // Apaga o loading e manda a máquina
            await msgLoading.delete();
            await message.reply({ 
                content: '# 🐯 FORTUNE TIGER KIBO 🐯\nGanhe combinando 3 símbolos na horizontal ou diagonal.\nMultiplicadores: 🐯 (100x), 💎 (50x), 🔔 (25x), 🍇 (10x), 🍋 (5x), 🍒 (2x).', 
                files: [attachment], 
                components: [row] 
            });
        } catch (err) {
            console.error("Erro ao abrir tigrinho:", err);
            msgLoading.edit('❌ Houve um erro ao carregar a máquina.');
        }
    }
};