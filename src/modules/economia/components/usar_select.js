import { prisma } from '../../../core/database.js';

export default {
    customId: 'usar_select',
    execute: async (interaction) => {
        const [invId, itemName] = interaction.values[0].split('_');

        try {
            // 1. Deleta a unidade específica do item do banco de dados
            await prisma.inventory.delete({
                where: { id: invId }
            });

            // 2. Define a mensagem de sucesso
            let mensagem = `Você usou o item **${itemName}** e ele foi consumido com sucesso!`;

            // 3. Atualiza a mensagem para o usuário
            await interaction.update({ 
                content: `# ⚡ ITEM UTILIZADO\n${mensagem}`, 
                components: [] 
            });

        } catch (error) {
            console.error("Erro ao usar item:", error);
            await interaction.reply({ content: '❌ Erro ao consumir o item. Tente novamente.', ephemeral: true });
        }
    }
};