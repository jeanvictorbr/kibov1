import { EmbedBuilder, MessageFlags } from 'discord.js';
import { prisma } from '../../../core/database.js';

export default {
    customId: 'assalto_intervir',
    execute: async (interaction) => {
        const copId = interaction.user.id;
        const msgId = interaction.message.id;

        // Puxa os dados da RAM
        const robberyData = global.activeRobberies.get(msgId);
        if (!robberyData) {
            return interaction.reply({ content: '❌ Tarde demais, chefe! O beco já tá vazio ou o enquadro já rolou.', flags: [MessageFlags.Ephemeral] });
        }

        // 1. TRAVA DA PROFISSÃO (Só Polícia pode intervir)
        const copDb = await prisma.user.findUnique({ where: { userId: copId } });
        if (!copDb || copDb.currentJob !== 'policial') {
            return interaction.reply({ content: '🛑 Sai da frente, paisano! Isso é trampo pra Polícia. Área isolada!', flags: [MessageFlags.Ephemeral] });
        }

        // 2. TRAVA DA JURISDIÇÃO (Só a polícia DAQUELA GUILDA)
        const hasBadge = await prisma.policeBadge.findUnique({
            where: { userId_guildId: { userId: copId, guildId: robberyData.guildId } }
        });

        if (!hasBadge) {
            return interaction.reply({ content: '🛑 **Fora de Jurisdição!** Cê não tem distintivo nessa quebrada. Deixa a PM local trampar!', flags: [MessageFlags.Ephemeral] });
        }

        if (copId === robberyData.robberId) {
            return interaction.reply({ content: '🤨 Qual foi? Vai se auto-prender no meio do assalto? Tá chapando!', flags: [MessageFlags.Ephemeral] });
        }

        // Apaga da memória pra ninguém mais clicar
        global.activeRobberies.delete(msgId);

        const robberId = robberyData.robberId;
        const loot = robberyData.loot;

        // --- ROLETA DO CONFRONTO (50% / 50%) ---
        const chance = Math.random() * 100;

        // --- LISTA DE 15 VITÓRIAS DA POLÍCIA ---
        const copWins = [
            { title: '🚨 BUSTED NA HORA!', desc: `O Oficial <@${copId}> chegou dando voadora com os dois pés! O <@${robberId}> voou longe e já caiu com as pulseiras de prata.` },
            { title: '⚡ ENQUADRO ZIKA!', desc: `O <@${robberId}> tentou dar o pinote, mas o <@${copId}> puxou a Taser. Tomou choque no lombo, caiu tremendo e foi pro xilindró!` },
            { title: '🧱 BECO SEM SAÍDA!', desc: `O <@${copId}> bloqueou a rua com a viatura. O <@${robberId}> tentou pular o muro, rasgou a calça na cerca de arame farpado e se entregou chorando.` },
            { title: '🎯 FRIO E CALCULISTA!', desc: `Pique atirador de elite! O <@${copId}> mandou um tiro de borracha no joelho do <@${robberId}>. O mano capotou com o malote na mão.` },
            { title: '🚁 HELICÓPTERO ÁGUIA!', desc: `O <@${robberId}> achou que tava safo no escuro, mas o <@${copId}> chamou o Águia. Jogaram a luz na cara do vagabundo e o enquadro foi lindo.` },
            { title: '🐕 CACHORRO DA PM!', desc: `O Oficial <@${copId}> soltou o Pastor Alemão do canil! O cachorro cravou o dente na canela do <@${robberId}>, que pediu arrego na hora.` },
            { title: '🏍️ BOTE DA ROCAM!', desc: `A viatura não passou, mas o <@${copId}> chegou de moto da ROCAM cortando giro. Fechou o <@${robberId}> no cruzamento e botou o cano na cara!` },
            { title: '🤦 TROPEÇOU NO PRÓPRIO PÉ!', desc: `Na emoção da fuga, o <@${robberId}> tropeçou num tijolo e caiu de boca no bueiro. O <@${copId}> nem precisou correr pra algemar.` },
            { title: '🌶️ SPRAY DE PIMENTA!', desc: `O <@${robberId}> partiu pra cima, mas o <@${copId}> esvaziou o spray de pimenta na cara dele. O bandido foi pra delegacia chorando igual criança.` },
            { title: '🔫 PNEU FURADO!', desc: `O <@${robberId}> ia dar fuga de carro, mas o <@${copId}> mandou dois tiros bem no pneu traseiro. O carro rodopiou e a casa caiu.` },
            { title: '🗣️ O X-9 CANTOU!', desc: `A vizinha caguetou a rota de fuga. O <@${copId}> já tava escorado na esquina esperando o <@${robberId}> passar com o malote. Perdeu, playboy!` },
            { title: '🥋 GRAVATA DE PEDREIRO!', desc: `Trocação franca no soco! O <@${copId}> não quis nem saber da farda, mandou um mata-leão no <@${robberId}> e apagou o truta no meio da rua.` },
            { title: '🎒 TINTA NO MALOTE!', desc: `O <@${robberId}> achou que tinha ganho, mas o malote de segurança explodiu tinta azul na cara dele. O <@${copId}> só seguiu o rastro de Smurf até prender.` },
            { title: '🚓 BARCA DA ROTA!', desc: `Quando o <@${robberId}> virou a esquina, deu de cara com a barca da ROTA. O <@${copId}> desceu com sangue nos olhos e o bandido já deitou no chão.` },
            { title: '🛑 BLOQUEIO POLICIAL!', desc: `O <@${copId}> jogou a cama de prego na avenida! O <@${robberId}> tentou furar o bloqueio, furou os dois pneus da moto e saiu ralando no asfalto.` }
        ];

        // --- LISTA DE 15 VITÓRIAS DO LADRÃO ---
        const robberWins = [
            { title: '💨 FUGA NO GRAU!', desc: `O <@${robberId}> já tava com uma Hornet sem placa ligada! Cortou giro na cara do Oficial <@${copId}> e sumiu no labirinto da favela.` },
            { title: '🥷 FUMAÇA NINJA!', desc: `O <@${copId}> chegou seco pra botar a mão, mas o <@${robberId}> estourou um gás lacrimogêneo, deu uma bicuda na canela do PM e evaporou.` },
            { title: '🎭 MIGUÉ DA SABESP!', desc: `Vestiu um uniforme da Sabesp na velocidade da luz! O <@${robberId}> passou varrendo a rua na frente do <@${copId}> com o malote escondido no carrinho.` },
            { title: '🚗 CAVALO DE PAU!', desc: `Um Opala preto sem farol passou cantando pneu, resgatou o <@${robberId}> e jogou a viatura do <@${copId}> no poste. A PM comeu poeira!` },
            { title: '🚌 FUGA DE BIARTICULADO!', desc: `O <@${robberId}> meteu o louco, correu pro corredor de ônibus, pulou a catraca do biarticulado e o <@${copId}> ficou preso no trânsito.` },
            { title: '🐱 PARKOUR DE LAJE!', desc: `Pique Homem-Aranha! O <@${robberId}> pulou o muro, subiu no telhado e saiu pulando de laje em laje. O <@${copId}> tentou ir atrás e caiu no quintal do vizinho.` },
            { title: '🌃 APAGÃO NA QUEBRADA!', desc: `O <@${robberId}> chutou a caixa de força do poste, a rua inteira ficou no escuro! Quando o <@${copId}> ligou a lanterna, o maluco já tava em outra cidade.` },
            { title: '🥟 BARRACA DE PASTEL!', desc: `O <@${robberId}> correu pro meio da feira livre, derrubou a barraca de pastel em cima do <@${copId}>, encheu a PM de caldo de cana e sumiu na multidão.` },
            { title: '🛵 CORREDOR DA RADIAL!', desc: `O <@${robberId}> pulou na garupa de um motoboy parceiro. Eles pegaram o corredor da Radial Leste no trânsito e a barca do <@${copId}> ficou entalada nos carros.` },
            { title: '🎵 NO MEIO DO FLUXO!', desc: `O <@${robberId}> correu pra dentro do Baile Funk que tava rolando. O <@${copId}> tentou entrar de viatura, mas a multidão fechou o cerco e o ladrão virou fumaça.` },
            { title: '🏎️ CIVIC REBAIXADO!', desc: `Resgate de cinema! Um Civic de vidro fumê e rebaixado encostou, o <@${robberId}> pulou pra dentro e passou a milhão na frente do <@${copId}>.` },
            { title: '🍔 DISFARCE DO IFOOD!', desc: `O cara tem a manha! O <@${robberId}> enfiou o dinheiro na bag vermelha de entregador, botou o capacete e passou cumprimentando o <@${copId}> bem de boa.` },
            { title: '🐢 BUEIRO MÁGICO!', desc: `O <@${copId}> até correu atrás, mas o <@${robberId}> puxou a tampa do esgoto e desceu pra tubulação igual uma Tartaruga Ninja com o malote.` },
            { title: '💸 FLANELINHA COMPRADO!', desc: `O <@${robberId}> jogou 100 conto na mão do flanelinha na esquina. Quando o <@${copId}> chegou perguntando, o flanelinha apontou pra direção contrária e salvou o ladrão.` },
            { title: '📻 RÁDIO QUEBRADO!', desc: `Sorte de malandro! Bem na hora que o <@${copId}> ia pedir reforço pra fechar o cerco, o rádio da PM ficou mudo. O <@${robberId}> aproveitou a brecha e meteu o pé.` }
        ];

        if (chance <= 50) {
            // --- A POLÍCIA GANHOU O TIROTEIO ---
            
            // Ladrão vai pra prisão por 30 mins
            const jailTime = new Date(Date.now() + 30 * 60 * 1000);
            await prisma.cooldown.upsert({
                where: { userId_command: { userId: robberId, command: 'preso' } },
                update: { expiresAt: jailTime },
                create: { userId: robberId, command: 'preso', expiresAt: jailTime }
            });

            // Recompensa do Policial (Ele ganha 30% do valor que estava no caixa)
            const copReward = Math.floor(loot * 0.30);
            await prisma.user.update({
                where: { userId: copId },
                data: { balance: { increment: copReward } }
            });

            // Sorteia a história de vitória da polícia
            const historiaSorteada = copWins[Math.floor(Math.random() * copWins.length)];

            const embedVitoria = new EmbedBuilder()
                .setTitle(historiaSorteada.title)
                .setDescription(`${historiaSorteada.desc}\n\n🔒 **O vagabundo rodou e pegou 30 minutos em Alcatraz!**\n💰 **O Oficial faturou $${copReward.toLocaleString('pt-BR')} pelo serviço!**`)
                .setColor('#0000FF')
                .setThumbnail('https://i.imgur.com/kO1p5z0.png');

            await interaction.update({ embeds: [embedVitoria], components: [] });

        } else {
            // --- O LADRÃO GANHOU O TIROTEIO E FUGIU ---

            await prisma.user.update({
                where: { userId: robberId },
                data: { balance: { increment: loot } }
            });

            // Sorteia a história de fuga do ladrão
            const historiaSorteada = robberWins[Math.floor(Math.random() * robberWins.length)];

            const embedFuga = new EmbedBuilder()
                .setTitle(historiaSorteada.title)
                .setDescription(`${historiaSorteada.desc}\n\n💸 **O Ladrão embolsou os $${loot.toLocaleString('pt-BR')} do caixa!**\n🤕 **A Polícia ficou só na saudade!**`)
                .setColor('#FF0000')
                .setThumbnail('https://i.imgur.com/8Qe8g2G.png');

            await interaction.update({ embeds: [embedFuga], components: [] });
        }
    }
};