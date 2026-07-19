import { AttachmentBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { generateScannerImage } from '../../../utils/canvasScanner.js'; // Importação do nosso Canvas

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

        if (!itemInstance) {
            return interaction.reply({ content: '❌ Item não encontrado no seu inventário!', flags: [ 64 ] });
        }

        // ==========================================
        // 📡 LÓGICA ESPECIAL: SCANNER CLANDESTINO
        // ==========================================
        if (itemName.toLowerCase() === 'scanner') {
            // Avisa o Discord que vamos gerar uma imagem demorada
            await interaction.deferUpdate();

            // Consome o item (Usando a sua lógica original de deletar ou diminuir quantidade)
            if (itemInstance.amount > 1) {
                await prisma.inventory.update({
                    where: { id: itemInstance.id },
                    data: { amount: { decrement: 1 } }
                });
            } else {
                await prisma.inventory.delete({ where: { id: itemInstance.id } });
            }

            // Busca os peixes grandes (Saldo na carteira maior que 5.000)
            const alvosDb = await prisma.user.findMany({
                where: { 
                    balance: { gt: 5000 },
                    userId: { not: userId } // Exclui o próprio usuário
                },
                orderBy: { balance: 'desc' },
                take: 3
            });

            const targetsData = [];
            for (const alvo of alvosDb) {
                try {
                    const discordUser = await interaction.client.users.fetch(alvo.userId);
                    const variacao = Math.floor(alvo.balance * 0.15); // Variação de 15% pra dar mistério
                    
                    targetsData.push({
                        tag: discordUser.username,
                        avatar: discordUser.displayAvatarURL({ extension: 'png', size: 128 }),
                        min: alvo.balance - variacao,
                        max: alvo.balance + variacao
                    });
                } catch (err) {
                    console.error("Erro ao buscar avatar pro scanner:", err);
                }
            }

            // Gera a foto épica do Radar
            const buffer = await generateScannerImage(targetsData);
            const attachment = new AttachmentBuilder(buffer, { name: 'radar_tatico.png' });

            // Edita a mensagem entregando a imagem e limpando o menu
            return interaction.editReply({ 
                content: '📡 **Scanner de Rede Clandestina Finalizado.**\n> 💡 *DICA: Guarde o @ do seu alvo e corra para usar `k roubar @alvo` antes que ele guarde a grana no cofre!*', 
                files: [attachment], 
                components: [] 
            });
        }

        // ==========================================
        // 🛠️ LÓGICA PADRÃO PARA OS OUTROS ITENS
        // ==========================================
        
        // 2. Remove apenas 1 unidade (usando sua lógica se tiver amount ou delete direto)
        if (itemInstance.amount > 1) {
            await prisma.inventory.update({
                where: { id: itemInstance.id },
                data: { amount: { decrement: 1 } }
            });
        } else {
            await prisma.inventory.delete({ where: { id: itemInstance.id } });
        }

        // 3. Resposta com a vantagem
        const msgVantagem = vantagens[itemName] || `Você usou ${itemName} com sucesso!`;

        await interaction.update({ 
            content: `# ⚡ ITEM ATIVADO\n${msgVantagem}`, 
            components: [] 
        });
    }
};