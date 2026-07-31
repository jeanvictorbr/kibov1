import { MessageFlags } from 'discord.js';
import { prisma } from '../../../core/database.js';

const DURACAO_PROTECAO_MIN = 30;

export default {
    customId: 'servico_invite',
    execute: async (interaction) => {
        const parts = interaction.customId.split('_');
        // ['servico', 'invite', tipo, valor, clienteId, prestadorId, acao]
        const tipo = parts[2];
        const valor = parseInt(parts[3], 10);
        const clienteId = parts[4];
        const prestadorId = parts[5];
        const acao = parts[6];

        // Só o cliente (quem paga o serviço) pode confirmar ou recusar
        if (interaction.user.id !== clienteId) {
            return interaction.reply({ content: '🔒 Só o contratante do serviço pode decidir essa proposta!', flags: [MessageFlags.Ephemeral] });
        }

        if (acao === 'recusar') {
            const msgs = {
                tratar: '🚫 O ferido recusou o curativo. Vai na fé mesmo, desmaiado!',
                advogar: '🚫 O preso recusou a defesa. Deixa ele sentar na cadeira quente!',
                segurar: '🚫 O cliente recusou a escolta. Se assaltarem, problema é dele!'
            };
            return interaction.update({ content: msgs[tipo] || '🚫 Proposta recusada.', embeds: [], components: [] });
        }

        const cliente = await prisma.user.findUnique({ where: { userId: clienteId } });
        const prestador = await prisma.user.findUnique({ where: { userId: prestadorId } });

        if (!cliente || cliente.balance < valor) {
            return interaction.update({ content: '🤡 O contratante não tem mais a grana na carteira! Serviço cancelado.', embeds: [], components: [] });
        }

        try {
            if (tipo === 'tratar') {
                // Médico: remove o status ferido do cliente
                if (prestador?.currentJob !== 'medico') {
                    return interaction.update({ content: '❌ O prestador não é mais Médico! Serviço cancelado.', embeds: [], components: [] });
                }
                const ferido = await prisma.cooldown.findUnique({
                    where: { userId_command: { userId: clienteId, command: 'ferido' } }
                });
                if (!ferido || ferido.expiresAt < new Date()) {
                    return interaction.update({ content: '✅ O ferido já se recuperou sozinho, serviço cancelado.', embeds: [], components: [] });
                }

                await prisma.$transaction([
                    prisma.user.update({ where: { userId: clienteId }, data: { balance: { decrement: valor } } }),
                    prisma.user.update({ where: { userId: prestadorId }, data: { balance: { increment: valor } } }),
                    prisma.cooldown.delete({ where: { userId_command: { userId: clienteId, command: 'ferido' } } })
                ]);

                return interaction.update({
                    content: `🩺 **CURATIVO FEITO!**\n\nO <@${prestadorId}> costurou as feridas do <@${clienteId}> e zerou o B.O da treta!\n\n💸 <@${clienteId}> pagou **$${valor.toLocaleString('pt-BR')}** pelo atendimento e já pode voltar pro crime.`,
                    embeds: [],
                    components: []
                });

            } else if (tipo === 'advogar') {
                // Advogado: reduz a pena do preso (base 30% + 3% por nível de Lábia)
                if (prestador?.currentJob !== 'advogado') {
                    return interaction.update({ content: '❌ O prestador não é mais Advogado! Serviço cancelado.', embeds: [], components: [] });
                }
                const preso = await prisma.cooldown.findUnique({
                    where: { userId_command: { userId: clienteId, command: 'preso' } }
                });
                if (!preso || preso.expiresAt < new Date()) {
                    return interaction.update({ content: '🕊️ O preso já saiu da cadeia, serviço cancelado.', embeds: [], components: [] });
                }

                const skills = typeof prestador.skills === 'string' ? JSON.parse(prestador.skills) : (prestador.skills || {});
                const labiaLvl = skills.labia || 1;
                const totalMin = Math.ceil((preso.expiresAt - new Date()) / 60000);
                const reducaoMin = Math.max(5, Math.floor(totalMin * (0.3 + labiaLvl * 0.03)));
                const novaPena = new Date(preso.expiresAt.getTime() - reducaoMin * 60 * 1000);

                await prisma.$transaction([
                    prisma.user.update({ where: { userId: clienteId }, data: { balance: { decrement: valor } } }),
                    prisma.user.update({ where: { userId: prestadorId }, data: { balance: { increment: valor } } }),
                    prisma.cooldown.update({ where: { userId_command: { userId: clienteId, command: 'preso' } }, data: { expiresAt: novaPena } })
                ]);

                return interaction.update({
                    content: `⚖️ **HABEAS CORPUS NA MESA!**\n\nO advogado <@${prestadorId}> rebateu o processo do <@${clienteId}> com a lábia afiada (Lábia Nv. **${labiaLvl}**)!\n\n📉 Pena reduzida em **${reducaoMin} minutos**\n💸 <@${clienteId}> pagou **$${valor.toLocaleString('pt-BR')}** de honorários.`,
                    embeds: [],
                    components: []
                });

            } else if (tipo === 'segurar') {
                // Segurança: ativa a proteção contra roubo por 30 minutos
                if (prestador?.currentJob !== 'seguranca') {
                    return interaction.update({ content: '❌ O prestador não é mais Segurança Privado! Serviço cancelado.', embeds: [], components: [] });
                }
                const jaProtegido = await prisma.cooldown.findUnique({
                    where: { userId_command: { userId: clienteId, command: 'protegido' } }
                });
                if (jaProtegido && jaProtegido.expiresAt > new Date()) {
                    return interaction.update({ content: '🛡️ O cliente já tá sob outra escolta, serviço cancelado.', embeds: [], components: [] });
                }

                const expira = new Date(Date.now() + DURACAO_PROTECAO_MIN * 60 * 1000);
                await prisma.$transaction([
                    prisma.user.update({ where: { userId: clienteId }, data: { balance: { decrement: valor } } }),
                    prisma.user.update({ where: { userId: prestadorId }, data: { balance: { increment: valor } } }),
                    prisma.cooldown.upsert({
                        where: { userId_command: { userId: clienteId, command: 'protegido' } },
                        update: { expiresAt: expira },
                        create: { userId: clienteId, command: 'protegido', expiresAt: expira }
                    })
                ]);

                return interaction.update({
                    content: `👮 **ESCOLTA ATIVADA!**\n\nO <@${prestadorId}> passou a sombra do <@${clienteId}> e agora ninguém encosta!\n\n🛡️ **${DURACAO_PROTECAO_MIN} minutos** blindado contra assalto.\n💸 <@${clienteId}> pagou **$${valor.toLocaleString('pt-BR')}** pela proteção.`,
                    embeds: [],
                    components: []
                });
            }

            return interaction.update({ content: '❌ Tipo de serviço desconhecido.', embeds: [], components: [] });
        } catch (error) {
            console.error(`[CRASH SERVIÇO] ${interaction.customId}:`, error);
            return interaction.update({ content: '❌ Erro interno ao fechar o serviço. Tenta de novo, chefe!', embeds: [], components: [] });
        }
    }
};
