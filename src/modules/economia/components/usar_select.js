import { prisma } from '../../../core/database.js';

export default {
    customId: 'usar_select',
    execute: async (interaction) => {
        const itemName = interaction.values[0];
        const userId = interaction.user.id;

        // Configuração das vantagens (Adicione seus itens aqui)
        const vantagens = {
            'Amuleto': '💎 Você ativou o Amuleto! Sua sorte aumentou e seus lucros nos próximos trabalhos serão 50% maiores!',
            'Colete': '🛡️ Você equipou o Colete! Você está protegido contra o próximo roubo ou ataque.',
            'Pé de Cabra': '🔨 Pé de cabra usado! Chances de sucesso em roubos aumentadas temporariamente.'
        };

        // 1. Acha uma única instância do item
        const itemInstance = await prisma.inventory.findFirst({
            where: { userId: userId, itemId: itemName }
        });

        if (!itemInstance) return interaction.reply({ content: 'Item não encontrado!', ephemeral: true });

        // 2. Remove apenas 1 unidade
        await prisma.inventory.delete({ where: { id: itemInstance.id } });

        // 3. Resposta com a vantagem
        const msgVantagem = vantagens[itemName] || `Você usou ${itemName} com sucesso!`;

        await interaction.update({ 
            content: `# ⚡ ITEM ATIVADO\n${msgVantagem}`, 
            components: [] 
        });
    }
};