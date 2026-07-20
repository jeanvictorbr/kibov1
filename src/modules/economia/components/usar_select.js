import { AttachmentBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { generateScannerImage } from '../../../utils/canvasScanner.js';

export default {
    customId: 'usar_select',
    execute: async (interaction) => {
        // Trava Imediata e aviso de "Bot está pensando"
        await interaction.deferUpdate().catch(() => {});

        const itemName = interaction.values[0];
        const userId = interaction.user.id;

        // Vantagens Padrão
        const vantagens = {
            'Amuleto': '💎 Você ativou o Amuleto! Sua sorte aumentou e seus lucros nos próximos trabalhos serão 50% maiores!',
            'Colete': '🛡️ Você equipou o Colete! Você está protegido contra o próximo roubo ou ataque.',
            'Pé de Cabra': '🔨 Pé de cabra usado! Chances de sucesso em roubos aumentadas temporariamente.'
        };

        const itemInstance = await prisma.inventory.findFirst({
            where: { userId: userId, itemId: itemName }
        });

        if (!itemInstance) {
            return interaction.followUp({ content: '❌ Você não tem mais esse item no inventário!', flags: [ 64 ] });
        }

        // ==========================================
        // 📡 SCANNER CLANDESTINO (Ultra Otimizado)
        // ==========================================
        if (itemName.toLowerCase() === 'scanner') {
            try {
                // 1. Consome o Scanner
                if (itemInstance.amount > 1) {
                    await prisma.inventory.update({
                        where: { id: itemInstance.id },
                        data: { amount: { decrement: 1 } }
                    });
                } else {
                    await prisma.inventory.delete({ where: { id: itemInstance.id } });
                }

                // 2. 🔥 O SEGREDO DA VELOCIDADE: Busca os 20 mais ricos globalmente (0.01 segundos)
                const alvosDb = await prisma.user.findMany({
                    where: { 
                        balance: { gt: 5000 },
                        userId: { not: userId } 
                    },
                    orderBy: { balance: 'desc' },
                    take: 20 
                });

                const targetsData = [];

                // 3. 🔥 Filtro inteligente: Testa 1 por 1. Assim que achar 3 no servidor, ele PARA o loop.
                for (const alvo of alvosDb) {
                    if (targetsData.length >= 3) break; // Já achou os 3? Foge do loop na hora!

                    try {
                        // Pergunta pro Discord só sobre ESSE usuário (Super Rápido)
                        const isMember = await interaction.guild.members.fetch(alvo.userId).catch(() => null);
                        if (!isMember) continue; // Não tá no servidor? Pula pro próximo!

                        const variacao = Math.floor(alvo.balance * 0.15); 
                        
                        targetsData.push({
                            tag: `@${isMember.user.username}`,
                            avatar: isMember.user.displayAvatarURL({ extension: 'png', size: 128 }),
                            min: alvo.balance - variacao,
                            max: alvo.balance + variacao
                        });
                    } catch (err) {
                        console.error("Erro ao puxar avatar:", err);
                    }
                }

                // 4. Gera a interface
                const buffer = await generateScannerImage(targetsData);
                const attachment = new AttachmentBuilder(buffer, { name: 'radar_tatico.png' });

                return interaction.editReply({ 
                    content: '📡 **Scanner de Rede Clandestina Finalizado.**\n> 💡 *DICA: Olhe o `@` na imagem e corra para usar `k roubar @alvo` antes que ele guarde a grana no cofre!*', 
                    files: [attachment], 
                    components: [] 
                });
            } catch (scannerError) {
                console.error("[ERRO SCANNER]", scannerError);
                return interaction.followUp({ content: '❌ Ocorreu uma interferência de sinal. Tente usar novamente.', flags: [ 64 ] });
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