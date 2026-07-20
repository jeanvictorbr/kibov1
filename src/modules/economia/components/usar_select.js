import { AttachmentBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { generateScannerImage } from '../../../utils/canvasScanner.js';

export default {
    customId: 'usar_select',
    execute: async (interaction) => {
        // 1. TRAVA IMEDIATA: Avisa o Discord que estamos processando pra não dar timeout
        await interaction.deferUpdate().catch(() => {});

        const itemName = interaction.values[0];
        const userId = interaction.user.id;

        // Vantagens padrão
        const vantagens = {
            'Amuleto': '💎 Você ativou o Amuleto! Sua sorte aumentou e seus lucros nos próximos trabalhos serão 50% maiores!',
            'Colete': '🛡️ Você equipou o Colete! Você está protegido contra o próximo roubo ou ataque.',
            'Pé de Cabra': '🔨 Pé de cabra usado! Chances de sucesso em roubos aumentadas temporariamente.'
        };

        const itemInstance = await prisma.inventory.findFirst({
            where: { userId: userId, itemId: itemName }
        });

        if (!itemInstance) {
            return interaction.followUp({ content: '❌ Você não tem mais esse item no inventário!', ephemeral: true });
        }

        // ==========================================
        // 📡 SCANNER CLANDESTINO
        // ==========================================
        if (itemName.toLowerCase() === 'scanner') {
            try {
                // Consome a bateria/unidade do Radar
                if (itemInstance.amount > 1) {
                    await prisma.inventory.update({
                        where: { id: itemInstance.id },
                        data: { amount: { decrement: 1 } }
                    });
                } else {
                    await prisma.inventory.delete({ where: { id: itemInstance.id } });
                }

                // Puxa os IDs de quem o bot já está enxergando no servidor, sem forçar loading
                const membrosServidorIds = interaction.guild ? Array.from(interaction.guild.members.cache.keys()) : [];

                // Prepara o filtro do banco de dados
                const queryFiltro = { 
                    balance: { gt: 5000 },
                    userId: { not: userId } // Tira o próprio usuário do radar
                };

                // Se conseguiu achar gente no servidor local, aplica o geofence!
                if (membrosServidorIds.length > 0) {
                    queryFiltro.userId.in = membrosServidorIds;
                }

                const alvosDb = await prisma.user.findMany({
                    where: queryFiltro,
                    orderBy: { balance: 'desc' },
                    take: 3
                });

                const targetsData = [];
                for (const alvo of alvosDb) {
                    try {
                        const discordUser = await interaction.client.users.fetch(alvo.userId);
                        const variacao = Math.floor(alvo.balance * 0.15); // Varia de 15% pra mais ou menos
                        
                        targetsData.push({
                            tag: `@${discordUser.username}`, // Mostra o arroba correto
                            avatar: discordUser.displayAvatarURL({ extension: 'png', size: 128 }),
                            min: alvo.balance - variacao,
                            max: alvo.balance + variacao
                        });
                    } catch (err) {
                        console.error("Erro ao puxar foto de alvo pro radar:", err);
                    }
                }

                // Gera a interface
                const buffer = await generateScannerImage(targetsData);
                const attachment = new AttachmentBuilder(buffer, { name: 'radar_tatico.png' });

                return interaction.editReply({ 
                    content: '📡 **Scanner de Rede Clandestina Finalizado.**\n> 💡 *DICA: Olhe o `@` na imagem e corra para usar `k roubar @alvo` antes que ele guarde a grana no cofre!*', 
                    files: [attachment], 
                    components: [] 
                });
            } catch (scannerError) {
                console.error("[ERRO SCANNER]", scannerError);
                return interaction.followUp({ content: '❌ Ocorreu uma interferência de sinal. Tente usar novamente.', ephemeral: true });
            }
        }

        // ==========================================
        // 🛠️ OUTROS ITENS COMUNS
        // ==========================================
        if (itemInstance.amount > 1) {
            await prisma.inventory.update({
                where: { id: itemInstance.id },
                data: { amount: { decrement: 1 } }
            });
        } else {
            await prisma.inventory.delete({ where: { id: itemInstance.id } });
        }

        const msgVantagem = vantagens[itemName] || `Você usou ${itemName} com sucesso!`;

        await interaction.editReply({ 
            content: `# ⚡ ITEM ATIVADO\n${msgVantagem}`, 
            components: [] 
        });
    }
};