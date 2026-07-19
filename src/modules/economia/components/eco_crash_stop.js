import { prisma } from '../../../core/database.js';

export default {
    // Pode ser name ou customId dependendo de como você carrega, mas mantenha o que estava antes:
    customId: 'crash_stop',
    execute: async (interaction) => {
        const [_, __, ownerId, aposta, mult] = interaction.customId.split('_');
        
        // 1. Verificação instantânea (usamos reply normal aqui porque não "adiamos" ainda)
        if (interaction.user.id !== ownerId) {
            return interaction.reply({ 
                content: '❌ Tira a mão, não é sua aposta!', 
                flags: [ 64 ] 
            });
        }

        // 2. Passou na verificação? Avisa o Discord que vamos rodar o banco de dados!
        await interaction.deferUpdate();

        const ganho = Math.floor(parseFloat(aposta) * parseFloat(mult));

        // 3. Atualiza o banco de dados
        await prisma.user.update({
            where: { userId: ownerId },
            data: { balance: { increment: ganho } }
        });

        // 4. Edita a mensagem com o cashout final
        await interaction.editReply({ 
            content: `# ✅ CASHOUT!\n**Você parou em ${mult}x e lucrou $${ganho.toLocaleString('pt-BR')} na sua CARTEIRA.**`, 
            files: [], 
            components: [] 
        });
    }
};