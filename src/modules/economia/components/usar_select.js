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
        // 🥷 LÓGICA DO ITEM: ESPECIALISTA (5 MINUTOS)
        // ==========================================
        if (itemName.toLowerCase() === 'especialista') {
            // 1. Consome o item 
            if (itemInstance.amount > 1) {
                await prisma.inventory.update({ where: { id: itemInstance.id }, data: { amount: { decrement: 1 } } });
            } else {
                await prisma.inventory.delete({ where: { id: itemInstance.id } });
            }

            // 2. Cria o tempo limite do buff (Agora + 5 minutos)
            const tempoBuff = new Date(Date.now() + 5 * 60 * 1000);

            // 3. Registra na tabela de cooldowns como uma "vantagem"
            await prisma.cooldown.upsert({
                where: { userId_command: { userId: userId, command: 'buff_especialista' } },
                update: { expiresAt: tempoBuff },
                create: { userId: userId, command: 'buff_especialista', expiresAt: tempoBuff }
            });

            return interaction.editReply({ 
                content: `# 🥷 ESPECIALISTA CONTRATADO!\n> Os rastros do seu IP foram apagados. Você está **TOTALMENTE IMUNE ao tempo de espera de roubo por 5 Minutos!** Corra e faça a festa!`, 
                components: [] 
            });
        }

        // ==========================================
        // 📡 LÓGICA DO ITEM: SCANNER CLANDESTINO
        // ==========================================
        if (itemName.toLowerCase() === 'scanner') {
            try {
                if (itemInstance.amount > 1) {
                    await prisma.inventory.update({ where: { id: itemInstance.id }, data: { amount: { decrement: 1 } } });
                } else {
                    await prisma.inventory.delete({ where: { id: itemInstance.id } });
                }

                const membrosServidorIds = interaction.guild ? Array.from(interaction.guild.members.cache.keys()) : [];
                const queryFiltro = { balance: { gt: 5000 }, userId: { not: userId } };
                if (membrosServidorIds.length > 0) { queryFiltro.userId.in = membrosServidorIds; }

                const alvosDb = await prisma.user.findMany({ where: queryFiltro, orderBy: { balance: 'desc' }, take: 20 });
                const targetsData = [];

                for (const alvo of alvosDb) {
                    if (targetsData.length >= 3) break; 
                    try {
                        const isMember = await interaction.guild.members.fetch(alvo.userId).catch(() => null);
                        if (!isMember) continue; 
                        const variacao = Math.floor(alvo.balance * 0.15); 
                        targetsData.push({
                            tag: `@${isMember.user.username}`,
                            avatar: isMember.user.displayAvatarURL({ extension: 'png', size: 128 }),
                            min: alvo.balance - variacao,
                            max: alvo.balance + variacao
                        });
                    } catch (err) { console.error("Erro ao puxar avatar:", err); }
                }

                const buffer = await generateScannerImage(targetsData);
                const attachment = new AttachmentBuilder(buffer, { name: 'radar_tatico.png' });

                return interaction.editReply({ 
                    content: '📡 **Scanner de Rede Clandestina Finalizado.**\n> 💡 *DICA: Olhe o `@` na imagem e corra para usar `k roubar @alvo` antes que ele guarde a grana no cofre!*', 
                    files: [attachment], components: [] 
                });
            } catch (scannerError) {
                console.error("[ERRO SCANNER]", scannerError);
                return interaction.followUp({ content: '❌ Ocorreu uma interferência de sinal. Tente usar novamente.', flags: [ 64 ] });
            }
        }

        // ==========================================
        // 🛠️ LÓGICA PADRÃO PARA OS OUTROS ITENS
        // ==========================================
        if (itemInstance.amount > 1) {
            await prisma.inventory.update({ where: { id: itemInstance.id }, data: { amount: { decrement: 1 } } });
        } else {
            await prisma.inventory.delete({ where: { id: itemInstance.id } });
        }

        const msgVantagem = vantagens[itemName] || `Você usou ${itemName} com sucesso!`;
        await interaction.editReply({ content: `# ⚡ ITEM ATIVADO\n${msgVantagem}`, components: [] });
    }
};