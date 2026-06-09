import { MessageFlags } from 'discord.js';

export default {
    customId: 'pix_cancel',
    execute: async (interaction) => {
        // Formato esperado: pix_cancel_IDDOUSUARIO
        const parts = interaction.customId.split('_');
        const senderId = parts[2]; 

        // Se outra pessoa tentar clicar, bloqueia invisivelmente usando a flag correta
        if (interaction.user.id !== senderId) {
            return interaction.reply({ 
                content: 'Tira a mão, chefe! Só quem iniciou o Pix pode cancelar.', 
                flags: [MessageFlags.Ephemeral] 
            });
        }

        // Apaga os botões e avisa que cancelou
        await interaction.update({ 
            content: '❌ **Transferência Pix cancelada.** O dinheiro continua no seu cofre.', 
            components: [] 
        });
    }
};