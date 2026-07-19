// ==========================================
        // 📡 LÓGICA ESPECIAL: SCANNER CLANDESTINO
        // ==========================================
        if (itemName.toLowerCase() === 'scanner') {
            // Avisa o Discord que vamos gerar uma imagem demorada
            await interaction.deferUpdate();

            // Consome o item 
            if (itemInstance.amount > 1) {
                await prisma.inventory.update({
                    where: { id: itemInstance.id },
                    data: { amount: { decrement: 1 } }
                });
            } else {
                await prisma.inventory.delete({ where: { id: itemInstance.id } });
            }

            // 🌟 NOVIDADE 1: Busca todo mundo que está NO SERVIDOR ATUAL
            // Dá um fetch pra garantir que a galera tá no cache do bot
            await interaction.guild.members.fetch().catch(() => {}); 
            const membrosServidorIds = Array.from(interaction.guild.members.cache.keys());

            // 🌟 NOVIDADE 2: Busca os alvos no Banco de Dados filtrando pelos IDs locais
            const alvosDb = await prisma.user.findMany({
                where: { 
                    balance: { gt: 5000 },
                    userId: { 
                        in: membrosServidorIds, // Filtra SÓ quem está no servidor atual
                        not: userId // Exclui o próprio cara que usou
                    }
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
                        // 🌟 NOVIDADE 3: Força o '@' + username oficial e único do Discord
                        tag: `@${discordUser.username}`, 
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
                content: '📡 **Scanner de Rede Clandestina Finalizado.**\n> 💡 *DICA: Olhe o `@` na imagem e corra para usar `k roubar @alvo` antes que ele guarde a grana no cofre!*', 
                files: [attachment], 
                components: [] 
            });
        }