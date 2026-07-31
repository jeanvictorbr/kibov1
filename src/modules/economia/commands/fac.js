import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { FACTIONS, FACTIONS_ORDER } from '../../../utils/factionConfig.js';
import { FACTION_ITEMS } from '../../../utils/factionItems.js';
import { generateFactionCanvas } from '../../../utils/canvasFaction.js';
import {
    getMemberOfUser,
    isPoliceOfficer,
    pendingCreation,
    readEstoque,
    removeFromEstoque,
    getFactionActiveWar,
    settleExpiredWars
} from '../../../utils/factionService.js';

const RANK_ORDER = { lider: 0, capo: 1, membro: 2 };

export default {
    name: 'fac',
    execute: async (message, args) => {
        const sub = (args[0] || '').toLowerCase();
        const userId = message.author.id;
        const guildId = message.guild.id;
        const rest = args.slice(1);

        switch (sub) {
            case 'criar': return createFaction(message, rest, userId, guildId);
            case 'convidar': return inviteMember(message, userId, guildId);
            case 'expulsar': return expelMember(message, userId, guildId);
            case 'promover': return promoteMember(message, userId);
            case 'sair': return leaveFaction(message, userId);
            case 'dissolver': return dissolveFaction(message, userId);
            case 'doar': return donateFaction(message, rest, userId);
            case 'banco': return showBank(message, userId);
            case 'estoque': return showEstoque(message, userId);
            case 'pegar': return takeItem(message, rest, userId);
            case 'vender': return sellItem(message, rest, userId);
            case 'mercado': return showMarket(message, guildId);
            case 'perfil': return showProfile(message, userId, guildId);
            case 'top': return showTop(message, guildId);
            case 'guerra': return warCommand(message, rest, userId, guildId);
            default: return sendHelp(message);
        }
    }
};

async function sendHelp(message) {
    const embed = new EmbedBuilder()
        .setTitle('🏴 COMANDOS DE FACÇÃO')
        .setDescription('Cria tua facção e domina o submundo da cidade! Cada ramo tem sua missão, seus buffs e uma mercadoria exclusiva.')
        .setColor('#FF5555')
        .addFields(
            { name: '📦 Criação', value: '`k fac criar <nome>` - Funda uma facção e escolhe o ramo no menu!\nRamos: ' + FACTIONS_ORDER.map(r => `${FACTIONS[r].emoji} \`${r}\``).join(' '), inline: false },
            { name: '👥 Membros', value: '`k fac convidar @user` - Recruta (Líder/Capo)\n`k fac expulsar @user` - Manda rodar (Líder/Capo)\n`k fac promover @user` - Sobe pra Capo (só Líder)\n`k fac sair` / `k fac dissolver` - Vaza ou acaba com a fac\n\n👑 Líder manda em tudo. ⭐ Capo pode convidar/expulsar. 🔫 Membro só opera.', inline: false },
            { name: '💰 Economia', value: '`k fac doar <valor>` - Bota grana no caixa\n`k fac banco` - Confere o caixa\n`k fac estoque` - Confere as mercadorias produzidas\n`k fac pegar <item> <qtd>` - Líder/Capo retira item do estoque pro próprio inventário (usa com `k usar`)', inline: false },
            { name: '🛒 Vendas', value: '`k fac vender <item> <qtd> <preco>` - Anuncia item da fac no mercado\n`k fac mercado` - Compra itens de outras facções\n\n🧪 Os itens dão buffs: drogas (+lucro), armas (+chance de assalto), Conta de Lavagem (taxa cortada), Script de Invasão (+XP), Mapa de Rotas (+influência). Usa com `k usar`!', inline: false },
            { name: '⚔️ Guerra', value: '`k fac guerra @membro [valor]` - Declara guerra contra a fac daquele mano (aposta mín. $20k, padrão $50k, sai do caixa)\n`k fac guerra` - Ver o placar e resolver guerras vencidas\n\nA guerra dura 60 minutos. Quem roubar membro da fac inimiga marca ponto (ataque/defesa). O vencedor leva o POTE (2x aposta) + 100 XP + 5 de influência!', inline: false },
            { name: '🎯 Missão', value: '`k operacao` - Executa a missão do ramo: você lucra, enche o caixa da fac, ganha XP/Influência e produz a mercadoria exclusiva do ramo pro estoque.', inline: false },
            { name: 'ℹ️ Info', value: '`k fac perfil` - Perfil da fac em imagem (com @user vê a fac de outra pessoa)\n`k fac top` - Ranking das facções da cidade', inline: false }
        );
    return message.reply({ embeds: [embed] });
}

async function createFaction(message, rest, userId, guildId) {
    if (rest.length === 0) {
        return message.reply('💡 Uso: `k fac criar <nome>` e depois escolhe o ramo no menu! Ex: `k fac criar Vida Loka`');
    }

    const name = rest.join(' ');

    if (name.length < 3 || name.length > 20) {
        return message.reply('❌ O nome da facção precisa ter entre 3 e 20 caracteres.');
    }
    if (!/^[A-Za-z0-9À-ÿ ]+$/.test(name)) {
        return message.reply('❌ O nome só pode ter letras e números (sem símbolos estranhos).');
    }

    const existing = await getMemberOfUser(userId, guildId);
    if (existing) return message.reply('❌ Você já faz parte de uma facção! Saia antes de criar outra.');

    const isPM = await isPoliceOfficer(userId, guildId);
    if (isPM) return message.reply('🚓 Oficial da PM não pode comandar uma facção criminosa! Largue o distintivo primeiro.');

    // Guarda o nome pendente e mostra o seletor de ramo
    pendingCreation.set(userId, { name, guildId, timestamp: Date.now() });

    // Descrição curta do ramo (limite do Discord: 100 caracteres)
    const shortDesc = (s) => (s.length <= 100 ? s : s.slice(0, 97) + '...');

    const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId(`fac_create_ramo_${userId}`)
            .setPlaceholder('Escolhe o ramo da facção...')
            .addOptions(
                FACTIONS_ORDER.map(r => ({
                    label: FACTIONS[r].name,
                    value: r,
                    description: shortDesc(FACTIONS[r].desc),
                    emoji: FACTIONS[r].emoji
                }))
            )
    );

    const embed = new EmbedBuilder()
        .setTitle('🏴 FUNDAÇÃO DE FACÇÃO')
        .setDescription(`Nome escolhido: **${name}**\n\nAgora escolhe o **ramo** da facção no menu abaixo. Cada ramo tem seu estilo de crime e seus buffs!`)
        .setColor('#FF5555')
        .setFooter({ text: 'Você tem 2 minutos pra decidir' });

    return message.reply({ embeds: [embed], components: [row] });
}

async function inviteMember(message, userId, guildId) {
    const member = await getMemberOfUser(userId, guildId);
    if (!member) return message.reply('❌ Você não é de nenhuma facção! Cria uma com `k fac criar <nome>`.');
    if (member.rank === 'membro') return message.reply('❌ Só Líder e Capo podem convidar.');

    const targetUser = message.mentions.users.first();
    if (!targetUser) return message.reply('Menciona quem quer recrutar! Ex: `k fac convidar @user`');
    if (targetUser.bot) return message.reply('🤖 Robô não entra na facção, chefe.');
    if (targetUser.id === userId) return message.reply('😂 Recrutar a si mesmo? Cê já tá dentro!');

    const faction = await prisma.faction.findUnique({ where: { id: member.factionId } });

    const targetMember = await getMemberOfUser(targetUser.id, guildId);
    if (targetMember) return message.reply('❌ O mano já é de outra facção!');

    const isPM = await isPoliceOfficer(targetUser.id, guildId);
    if (isPM) return message.reply('🚓 O alvo é Oficial da PM! Ele tem que largar o distintivo antes de entrar pro crime.');

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`fac_invite_aceitar_${faction.id}_${targetUser.id}`).setLabel('✅ Aceitar').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`fac_invite_recusar_${faction.id}_${targetUser.id}`).setLabel('❌ Recusar').setStyle(ButtonStyle.Danger)
    );

    return message.channel.send({
        content: `${targetUser}, a **${faction.name}** [${faction.tag}] te chamou pro crime! Aceita o desenrolo?`,
        components: [row]
    });
}

async function expelMember(message, userId, guildId) {
    const member = await getMemberOfUser(userId, guildId);
    if (!member) return message.reply('❌ Você não é de nenhuma facção.');
    if (member.rank === 'membro') return message.reply('❌ Só Líder e Capo podem expulsar.');

    const targetUser = message.mentions.users.first();
    if (!targetUser) return message.reply('Menciona quem vai rodar! Ex: `k fac expulsar @user`');

    const target = await getMemberOfUser(targetUser.id, guildId);
    if (!target || target.factionId !== member.factionId) return message.reply('❌ Esse mano não é da sua facção!');

    if (target.rank === 'lider') return message.reply('👑 Não dá pra expulsar o líder, né?');
    if (member.rank === 'capo' && target.rank === 'capo') return message.reply('❌ Capo não expulsa capo. Só o líder.');

    await prisma.factionMember.delete({ where: { id: target.id } });
    return message.reply(`💥 **RODOU!** O <@${targetUser.id}> foi expulso da facção com o rabo entre as pernas.`);
}

async function promoteMember(message, userId) {
    const member = await getMemberOfUser(userId);
    if (!member) return message.reply('❌ Você não é de nenhuma facção.');
    if (member.rank !== 'lider') return message.reply('👑 Só o Líder pode promover alguém pra Capo.');

    const targetUser = message.mentions.users.first();
    if (!targetUser) return message.reply('Menciona quem vai subir! Ex: `k fac promover @user`');

    const target = await getMemberOfUser(targetUser.id);
    if (!target || target.factionId !== member.factionId) return message.reply('❌ Esse mano não é da sua facção!');
    if (target.rank !== 'membro') return message.reply('❌ Só dá pra promover membro pra Capo.');

    await prisma.factionMember.update({ where: { id: target.id }, data: { rank: 'capo' } });
    return message.reply(`⭐ **PROMOVIDO!** O <@${targetUser.id}> agora é **Capo** da facção!`);
}

async function leaveFaction(message, userId) {
    const member = await getMemberOfUser(userId);
    if (!member) return message.reply('❌ Você não é de nenhuma facção.');
    if (member.rank === 'lider') {
        return message.reply('👑 Você é o líder! Se quiser acabar com a facção, usa `k fac dissolver`.');
    }
    await prisma.factionMember.delete({ where: { id: member.id } });
    return message.reply('🏃 **Você vazou da facção.** A boa vida do crime acabou, por enquanto.');
}

async function dissolveFaction(message, userId) {
    const member = await getMemberOfUser(userId);
    if (!member) return message.reply('❌ Você não é de nenhuma facção.');
    if (member.rank !== 'lider') return message.reply('👑 Só o líder pode dissolver a facção.');

    await prisma.faction.delete({ where: { id: member.factionId } }); // Cascade apaga os membros
    return message.reply('💀 **FACÇÃO DISSOLVIDA!** O nome foi apagado do submundo. Respeito é memória.');
}

async function donateFaction(message, rest, userId) {
    const member = await getMemberOfUser(userId);
    if (!member) return message.reply('❌ Você não é de nenhuma facção.');

    const value = rest.find(a => typeof a === 'number');
    if (!value || value <= 0) return message.reply('💸 Manda o valor! Ex: `k fac doar 50000`');

    const user = await prisma.user.findUnique({ where: { userId } });
    if (!user || user.balance < value) return message.reply(`❌ Você não tem **$${value.toLocaleString('pt-BR')}** na carteira pra doar!`);

    await prisma.$transaction([
        prisma.user.update({ where: { userId }, data: { balance: { decrement: value } } }),
        prisma.faction.update({ where: { id: member.factionId }, data: { bank: { increment: value } } })
    ]);

    return message.reply(`💰 **DOAÇÃO CONFIRMADA!** **$${value.toLocaleString('pt-BR')}** foi pro caixa da facção.`);
}

async function showBank(message, userId) {
    const member = await getMemberOfUser(userId);
    if (!member) return message.reply('❌ Você não é de nenhuma facção.');
    const faction = await prisma.faction.findUnique({ where: { id: member.factionId } });
    return message.reply(`💰 **Caixa da ${faction.name}** [${faction.tag}]: **$${faction.bank.toLocaleString('pt-BR')}**`);
}

async function showEstoque(message, userId) {
    const member = await getMemberOfUser(userId);
    if (!member) return message.reply('❌ Você não é de nenhuma facção.');
    const faction = await prisma.faction.findUnique({ where: { id: member.factionId } });

    const estoque = readEstoque(faction);
    const itens = Object.entries(estoque).filter(([, qtd]) => qtd > 0);

    if (itens.length === 0) {
        return message.reply(`📦 **Estoque da ${faction.name}** [${faction.tag}] está vazio!\nRoda um \`k operacao\` que as mercadorias caem pra vocês.`);
    }

    const text = itens.map(([itemId, qtd]) => {
        const item = FACTION_ITEMS[itemId];
        return `${item ? item.emoji + ' ' + item.name : itemId} × ${qtd}`;
    }).join('\n');

    return message.reply(`📦 **Estoque da ${faction.name}** [${faction.tag}]:\n\n${text}\n\nLíder/Capo podem retirar com \`k fac pegar <item> <qtd>\` ou anunciar com \`k fac vender <item> <qtd> <preco>\``);
}

async function takeItem(message, rest, userId) {
    const member = await getMemberOfUser(userId);
    if (!member) return message.reply('❌ Você não é de nenhuma facção.');
    if (member.rank === 'membro') return message.reply('❌ Só Líder e Capo podem retirar itens do estoque da facção.');

    const itemId = (rest[0] || '').toLowerCase();
    const numbers = rest.filter(a => typeof a === 'number');
    const qtd = Math.floor(numbers[0] || 1);

    if (!FACTION_ITEMS[itemId]) {
        return message.reply(`❌ Item inválido! Os itens produzíveis são: ${Object.keys(FACTION_ITEMS).map(k => `\`${k}\``).join(' ')}`);
    }
    if (qtd <= 0) {
        return message.reply('💡 Uso: `k fac pegar <item> <qtd>`\nEx: `k fac pegar droga_leve 2`');
    }

    const faction = await prisma.faction.findUnique({ where: { id: member.factionId } });
    const estoque = readEstoque(faction);
    if (!estoque[itemId] || estoque[itemId] < qtd) {
        return message.reply(`❌ Sua facção não tem **${qtd}** desse item no estoque!`);
    }

    // Tira do estoque da fac e cai no inventário pessoal do líder/capo
    await removeFromEstoque(member.factionId, itemId, qtd);

    const item = FACTION_ITEMS[itemId];
    const existingItem = await prisma.inventory.findFirst({
        where: { userId, itemId: item.name }
    });
    if (existingItem) {
        await prisma.inventory.update({ where: { id: existingItem.id }, data: { amount: { increment: qtd } } });
    } else {
        await prisma.inventory.create({
            data: { userId, itemId: item.name, amount: qtd }
        });
    }

    return message.reply(`🎒 **ITEM RETIRADO DO ESTOQUE!**\n${item.emoji} **${item.name}** × ${qtd} foi pro seu inventário.\nUsa com \`k usar\` pra ativar o buff — ${item.desc}`);
}

async function sellItem(message, rest, userId) {
    const member = await getMemberOfUser(userId);
    if (!member) return message.reply('❌ Você não é de nenhuma facção.');
    if (member.rank === 'membro') return message.reply('❌ Só Líder e Capo podem vender itens da facção.');

    const itemId = (rest[0] || '').toLowerCase();
    const numbers = rest.filter(a => typeof a === 'number');
    const qtd = Math.floor(numbers[0] || 1);
    const preco = Math.floor(numbers[1] || 0);

    if (!FACTION_ITEMS[itemId]) {
        return message.reply(`❌ Item inválido! Os itens produzíveis são: ${Object.keys(FACTION_ITEMS).map(k => `\`${k}\``).join(' ')}`);
    }
    if (qtd <= 0 || preco <= 0) {
        return message.reply('💡 Uso: `k fac vender <item> <qtd> <preco>`\nEx: `k fac vender droga_leve 2 20000`');
    }

    const faction = await prisma.faction.findUnique({ where: { id: member.factionId } });
    const estoque = readEstoque(faction);
    if (!estoque[itemId] || estoque[itemId] < qtd) {
        return message.reply(`❌ Sua facção não tem **${qtd}** desse item no estoque!`);
    }

    // Tira do estoque e cria o anúncio
    await removeFromEstoque(member.factionId, itemId, qtd);
    await prisma.factionListing.create({
        data: { factionId: member.factionId, guildId: message.guild.id, itemId, qty: qtd, price: preco }
    });

    const item = FACTION_ITEMS[itemId];
    return message.reply(`🛒 **ANÚNCIO CRIADO!** ${item.emoji} **${item.name}** × ${qtd} por **$${preco.toLocaleString('pt-BR')}** cada.\nQuem quiser, usa **k fac mercado**!`);
}

async function showMarket(message, guildId) {
    const listings = await prisma.factionListing.findMany({
        where: { guildId },
        include: { faction: true },
        orderBy: { createdAt: 'desc' }
    });

    if (listings.length === 0) {
        return message.reply('🛒 **Mercado de facções vazio!** As facções ainda não anunciaram nada. Sendo uma, use `k fac vender`.');
    }

    const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId(`fac_market_${message.author.id}`)
            .setPlaceholder('Escolhe o que comprar...')
            .addOptions(
                listings.slice(0, 25).map(l => {
                    const item = FACTION_ITEMS[l.itemId];
                    const total = l.price * l.qty;
                    const desc = `${l.faction.name} | R$${total.toLocaleString('pt-BR')} ($${l.price.toLocaleString('pt-BR')}/un)`;
                    return {
                        label: `${item.emoji} ${item.name} × ${l.qty}`,
                        value: l.id,
                        description: desc.length <= 100 ? desc : desc.slice(0, 97) + '...'
                    };
                })
            )
    );

    const lista = listings.slice(0, 10).map(l => {
        const item = FACTION_ITEMS[l.itemId];
        return `${item.emoji} **${item.name}** × ${l.qty} - ${l.faction.name} [${l.faction.tag}] - **$${(l.price * l.qty).toLocaleString('pt-BR')}**`;
    }).join('\n');

    return message.reply({
        content: `🛒 **MERCADO DE FACÇÕES**\n\n${lista}\n\nEscolha no menu abaixo pra comprar (o valor sai da sua carteira e vai pro caixa da facção vendedora):`,
        components: [row]
    });
}

async function showProfile(message, userId, guildId) {
    const targetUser = message.mentions.users.first() || message.author;
    const member = await getMemberOfUser(targetUser.id, guildId);
    if (!member) return message.reply(`O <@${targetUser.id}> não é de nenhuma facção nessa cidade.`);

    const faction = await prisma.faction.findUnique({
        where: { id: member.factionId },
        include: { members: true }
    });
    const config = FACTIONS[faction.ramo];

    // Busca os usuários do Discord de todos os membros (líder primeiro, depois por rank)
    const ordered = faction.members
        .sort((a, b) => RANK_ORDER[a.rank] - RANK_ORDER[b.rank]);

    const users = await Promise.all(ordered.map(m =>
        message.client.users.fetch(m.userId).catch(() => null)
    ));
    const memberUsers = users.map((u, i) => ({ user: u, rank: ordered[i].rank }))
        .filter(mu => mu.user);
    const leaderUser = memberUsers.find(mu => mu.rank === 'lider')?.user || memberUsers[0]?.user;

    if (!leaderUser) {
        return message.reply('❌ Não consegui carregar os dados do líder pra desenhar o perfil.');
    }

    // Se a facção estiver em guerra, puxa a info pra exibir na faixa do canvas
    const activeWar = await getFactionActiveWar(faction.id);
    let warInfo = null;
    if (activeWar && activeWar.status === 'ativo') {
        const opponentId = activeWar.factionAId === faction.id ? activeWar.factionBId : activeWar.factionAId;
        const opponent = await prisma.faction.findUnique({ where: { id: opponentId } });
        const meuPonto = activeWar.factionAId === faction.id ? activeWar.pointsA : activeWar.pointsB;
        const pontoOponente = activeWar.factionAId === faction.id ? activeWar.pointsB : activeWar.pointsA;
        warInfo = {
            opponentName: opponent?.name || '???',
            opponentTag: opponent?.tag || '???',
            pot: activeWar.bet * 2,
            score: `${meuPonto} x ${pontoOponente}`
        };
    }

    try {
        const buffer = await generateFactionCanvas(faction, config, leaderUser, memberUsers, warInfo);
        const attachment = new AttachmentBuilder(buffer, { name: 'fac_perfil.png' });
        return message.reply({ files: [attachment] });
    } catch (err) {
        console.error('Erro ao desenhar perfil da facção:', err);
        return message.reply('❌ Tive um problema ao desenhar o perfil da facção. Tenta novamente!');
    }
}

async function showTop(message, guildId) {
    const factions = await prisma.faction.findMany({
        where: { guildId },
        orderBy: [{ nivel: 'desc' }, { xp: 'desc' }],
        take: 10
    });

    if (factions.length === 0) {
        return message.reply('📭 Nenhuma facção fundada nessa cidade ainda! Seja o primeiro com `k fac criar <nome>`.');
    }

    const text = factions.map((f, i) => {
        const config = FACTIONS[f.ramo];
        return `${i + 1}º. ${config.emoji} **${f.name}** [${f.tag}] | Nv. ${f.nivel} | Líder <@${f.leaderId}>`;
    }).join('\n');

    return message.reply(`🏴 **RANKING DE FACÇÕES DA CIDADE**\n\n${text}`);
}

// ==========================================
// ⚔️ GUERRA DE FACÇÕES
// ==========================================
const WAR_DURACAO_MIN = 60;
const WAR_BET_MIN = 20000;

async function warCommand(message, rest, userId, guildId) {
    const member = await getMemberOfUser(userId, guildId);
    if (!member) return message.reply('❌ Você não é de nenhuma facção! Cria uma com `k fac criar <nome>`.');
    const faction = await prisma.faction.findUnique({ where: { id: member.factionId } });

    // ---------- SEM ARGS: mostra o status (e resolve guerras vencidas) ----------
    if (rest.length === 0) {
        const settled = await settleExpiredWars(guildId);
        for (const { msg } of settled) {
            message.channel.send(msg).catch(() => {});
        }

        const active = await getFactionActiveWar(faction.id);
        if (active) {
            const opponentId = active.factionAId === faction.id ? active.factionBId : active.factionAId;
            const opponent = await prisma.faction.findUnique({ where: { id: opponentId } });

            if (active.status === 'proposta') {
                if (active.factionAId === faction.id) {
                    return message.reply(`⏳ Sua facção propôs guerra contra a **${opponent.name}** [${opponent.tag}]! Aguardando o Líder deles decidir.`);
                }
                return message.reply(`⏳ Sua facção foi **DESAFIADA** pela **${opponent.name}** [${opponent.tag}]! O Líder <@${faction.leaderId}> precisa aceitar ou recusar nos botões da declaração.`);
            }

            const meuPonto = active.factionAId === faction.id ? active.pointsA : active.pointsB;
            const pontoOponente = active.factionAId === faction.id ? active.pointsB : active.pointsA;
            const minRestantes = Math.max(0, Math.ceil((new Date(active.endsAt) - new Date()) / 60000));

            return message.reply(`⚔️ **GUERRA EM ANDAMENTO!**\n\n**${faction.name}** [${faction.tag}] **vs** **${opponent.name}** [${opponent.tag}]\n\n> 🔫 Placar: **${meuPonto} x ${pontoOponente}**\n> ⏳ Restam **${minRestantes} minutos**\n> 🏆 Pote: **$${(active.bet * 2).toLocaleString('pt-BR')}**\n\n*Roubem membros da facção inimiga pra marcar pontos!*`);
        }

        if (settled.length > 0) {
            return message.reply('🕊️ Guerra(s) encerrada(s) resolvida(s) aí em cima! Se quiser mais treta: `k fac guerra @membro [valor]`.');
        }

        return message.reply('🕊️ Sua facção não tá em guerra! Desafia outra: `k fac guerra @membro [valor]`');
    }

    // ---------- COM ARGS: declara guerra ----------
    const targetUser = message.mentions.users.first();
    if (!targetUser) {
        return message.reply('💡 Menciona um membro da facção inimiga! Ex: `k fac guerra @membro 50000`');
    }
    if (member.rank !== 'lider') {
        return message.reply('👑 Só o **Líder** pode declarar guerra!');
    }
    if (targetUser.id === userId) {
        return message.reply('😂 Guerra contra a própria facção? Aí não, chefe.');
    }
    if (targetUser.bot) {
        return message.reply('🤖 Robô não tem facção pra guerrear.');
    }

    const targetMember = await getMemberOfUser(targetUser.id, guildId);
    if (!targetMember || targetMember.factionId === faction.id) {
        return message.reply('❌ Marca alguém de OUTRA facção pra declarar guerra!');
    }

    const targetFaction = await prisma.faction.findUnique({ where: { id: targetMember.factionId } });
    if (!targetFaction || targetFaction.guildId !== guildId) {
        return message.reply('❌ Essa facção é de outra cidade!');
    }

    const bet = Math.floor(rest.find(a => typeof a === 'number') || 50000);
    if (bet < WAR_BET_MIN) {
        return message.reply(`💸 A aposta mínima é **$${WAR_BET_MIN.toLocaleString('pt-BR')}** por facção!`);
    }

    const warA = await getFactionActiveWar(faction.id);
    if (warA) return message.reply('❌ Sua facção já tá envolvida numa guerra! Espera terminar.');
    const warB = await getFactionActiveWar(targetFaction.id);
    if (warB) return message.reply(`❌ A **${targetFaction.name}** já tá envolvida numa guerra!`);

    if (faction.bank < bet) {
        return message.reply(`❌ Sua facção só tem **$${faction.bank.toLocaleString('pt-BR')}** no caixa! A aposta é **$${bet.toLocaleString('pt-BR')}**.`);
    }
    if (targetFaction.bank < bet) {
        return message.reply(`❌ A **${targetFaction.name}** só tem **$${targetFaction.bank.toLocaleString('pt-BR')}** no caixa, não cobre a aposta!`);
    }

    const war = await prisma.factionWar.create({
        data: { guildId, channelId: message.channel.id, factionAId: faction.id, factionBId: targetFaction.id, bet }
    });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`fac_war_aceitar_${war.id}`).setLabel('⚔️ Aceitar Guerra').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(`fac_war_recusar_${war.id}`).setLabel('🕊️ Recusar').setStyle(ButtonStyle.Secondary)
    );

    return message.channel.send({
        content: `⚔️ **DECLARAÇÃO DE GUERRA!**\n\nO Líder da **${faction.name}** [${faction.tag}] desafiou a **${targetFaction.name}** [${targetFaction.tag}]!\n\n🏆 **Aposta:** **$${bet.toLocaleString('pt-BR')}** por facção. O vencedor leva **$${(bet * 2).toLocaleString('pt-BR')}**.\n⏳ A guerra dura **${WAR_DURACAO_MIN} minutos** e quem fizer mais roubos contra a facção inimiga vence!\n\n<@${targetFaction.leaderId}>, aceita o confronto?`,
        components: [row]
    });
}
