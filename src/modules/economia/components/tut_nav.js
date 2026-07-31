import { MessageFlags } from 'discord.js';

export default {
    customId: 'tut_nav',
    execute: async (interaction) => {
        
        // 🔒 TRAVA DE SEGURANÇA: Só quem chamou o comando pode clicar
        const reference = interaction.message.reference;
        if (reference) {
            try {
                const originalMsg = await interaction.channel.messages.fetch(reference.messageId);
                if (interaction.user.id !== originalMsg.author.id) {
                    return interaction.reply({ 
                        content: '🛑 Tá moscando, curioso? Esse manual foi aberto por outra pessoa. Digita `k tutorial` no chat pra você abrir o seu!', 
                        flags: [MessageFlags.Ephemeral] 
                    });
                }
            } catch (e) {
                // Se a mensagem original foi apagada, segue o baile
            }
        }

        const escolha = interaction.values[0];
        let texto = '';

        if (escolha === 'banco') {
            texto = `💰 **O BÁSICO: ECONOMIA E BANCO**\n\n` +
            `Dinheiro na mão é vendaval, e na rua ladrão rouba. Se liga como cuidar do seu malote:\n\n` +
            `**1. Dinheiro do Governo:**\n` +
            `- \`k daily\`: Pega sua grana a cada 24 horas.\n` +
            `- \`k mensal\`: Bônus pesado a cada 30 dias.\n\n` +
            `**2. O Banco Seguro:**\n` +
            `- \`k depositar [valor]\` ou \`k depall\`: Guarda sua grana no banco pra não perder no crime.\n` +
            `- \`k sacar [valor]\`: Puxa a grana em espécie pra mão.\n\n` +
            `**3. Negócios e Status:**\n` +
            `- \`k pix @user [valor]\`: Transfere grana limpa pra um parceiro.\n` +
            `- \`k extrato\`: Puxa o papel pra ver quem te pagou ou quem te roubou.\n` +
            `- \`k rank\` ou \`k top\`: Vê quem são os maiores magnatas da cidade.`;
        } 
        else if (escolha === 'crypto') {
            texto = `💹 **BOLSAS DE VALORES E DAY TRADE (Kibo Exchange)**\n\n` +
            `Quer virar baleia e fazer fortuna na alta? A bolsa de valores da Deep Web é o lugar onde os magnatas multiplicam o malote:\n\n` +
            `- **O Painel Principal (\`k crypto\`):** Abre o terminal visual interativo com o seu avatar em neon, contendo botões de navegação fluida.\n` +
            `- **As Cotações:** O mercado global conta com **9 moedas** (desde stablecoins e moedas oficiais até MemeCoins voláteis e as exclusivas de elite *KiboDiamond* e *QuantumKibo*).\n` +
            `- **Atualização Automática:** Os preços mudam a cada **10 minutos**, com oscilações que podem derreter ou explodir até 45% nas MemeCoins!\n` +
            `- **Taxa de Corretora (Gas Fee):** Toda compra ou venda cobra uma taxa de **2%** para equilibrar a economia do servidor.\n` +
            `- **Preço Médio e Lucro:** Ao clicar em uma moeda específica, você vê o gráfico de linha em tempo real, seus ativos e a porcentagem exata de retorno do seu investimento.\n` +
            `- **Kibo News & Hall da Fama:** Acesse o jornal cyberpunk integrado para ler notícias exclusivas do mercado ou use \`k cryptotop\` para ver o pódio com as maiores Baleias da cidade.\n` +
            `- **Comandos Rápidos:** \`k cc <moeda> <qtd>\` para comprar e \`k vc <moeda> <qtd|tudo>\` para vender direto no Pix!`;
        }
        else if (escolha === 'trampos') {
            texto = `🏢 **EMPREGOS E TRAMPOS (k executar)**\n\n` +
            `Usa o \`k trabalhar\` pra escolher uma profissão. Cada uma tem seu esquema quando você usa o **\`k executar\`** (cooldown de 10 min, ou 5 min se for VIP):\n\n` +
            `👷 **Cidadão Honesto:** Rende de $1.000 a $3.000. **0% de Risco.** Trampo seguro.\n\n` +
            `🚓 **Oficial de Polícia:** Rende de $2.000 a $5.000. Tem 15% de chance de dar B.O na patrulha. **Requer distintivo do Delegado** (\`k contratar\`) e libera \`k prender\` e \`k revistar\`.\n\n` +
            `🥷 **Ladrão de Rua:** Rende de $3.000 a $7.000. Tem 30% de chance de apanhar na fuga. **Libera comandos exclusivos** como \`k assaltar_caixa\` e o evento do \`k carroforte\`.\n\n` +
            `💻 **Hacker:** Rende de $4.000 a $9.000. Lucro gigante, mas tem 35% de chance de rastrearem seu IP.\n\n` +
            `🩺 **Médico:** Rende de $2.000 a $4.500. Cura os feridos do morro cobrando caro (\`k tratar @ferido [valor]\`).\n\n` +
            `⚖️ **Advogado:** Rende de $2.500 a $5.500. Tira preso da cana com \`k advogar @preso [valor]\` — a redução de pena sobe com sua **Lábia**!\n\n` +
            `👮 **Segurança Privado:** Rende de $3.000 a $6.000. Blinda clientes contra roubo por 30 min (\`k segurar @cliente [valor]\`).\n\n` +
            `🧨 **Sequestrador:** Rende de $3.500 a $7.000. Rende Força! O comando \`k sequestrar @rico\` só mira em quem tem **$30.000+** na conta.\n\n` +
            `📦 **Contrabandista:** Rende de $4.000 a $8.000. O comando \`k contrabandear\` atravessa carga suja na fronteira — **70% do lucro sai sujo** e precisa ser lavado!`;
        } 
        else if (escolha === 'faccoes') {
            texto = `🏴 **FACÇÕES DO SUBMUNDO**\n\n` +
            `Cansou de trampar sozinho? Funda tua facção e domina a cidade. Se liga no desenrolo:\n\n` +
            `📦 **Criando a Facção (\`k fac criar <nome>\`):**\n` +
            `- Você escolhe o **ramo** no menu: 💊 Tráfico, 🔫 Armas, 💵 Lavagem, 💻 Hacking ou 🚚 Transporte.\n` +
            `- PM não pode comandar facção! Se for Oficial, troca de emprego no \`k trabalhar\` antes.\n\n` +
            `🎯 **Operações (\`k operacao\`):**\n` +
            `- Roda a missão do ramo: lucra pra você, enche o **caixa** da fac e dá **XP/Influência**.\n` +
            `- Toda operação produz a **mercadoria exclusiva** do ramo (drogas, armas, Conta de Lavagem, Script de Invasão, Mapa de Rotas) que vai pro estoque.\n` +
            `- Esses itens podem ser **vendidos** (\`k fac vender <item> <qtd> <preco>\`) no mercado (\`k fac mercado\`) pra outras facções.\n\n` +
            `👥 **Membros e Comando:**\n` +
            `- \`k fac convidar @user\` (Líder/Capo), \`k fac expulsar @user\`, \`k fac promover @user\` (só Líder pra Capo), \`k fac sair\`, \`k fac dissolver\`.\n` +
            `- \`k fac doar <valor>\` bota grana no caixa; \`k fac banco\` e \`k fac estoque\` conferem as contas.\n` +
            `- \`k fac perfil\` mostra a ficha completa da fac em imagem; \`k fac top\` é o ranking da cidade.\n\n` +
            `⚔️ **Guerra de Facções (\`k fac guerra @membro [valor]\`):**\n` +
            `- Só Líder declara, com aposta de no mínimo **$20.000** (padrão $50k) que sai do caixa de cada lado.\n` +
            `- O Líder inimigo decide nos botões. Se aceitar, a guerra dura **60 minutos**.\n` +
            `- **Quem roubar membro da fac inimiga marca ponto!** No fim, o vencedor leva o pote (2x aposta) + 100 XP + 5 de influência.\n` +
            `- \`k fac guerra\` (sem alvo) mostra o placar e resolve guerras que terminaram.`;
        }
        else if (escolha === 'crime') {
            texto = `🥷 **A VIDA DO CRIME E O SUBMUNDO**\n\n` +
            `Escolheu a profissão de Ladrão? Então destravou o arsenal pesado. Pega a visão:\n\n` +
            `🧨 **O Grande Assalto (\`k assaltar_caixa\`):**\n` +
            `- Você tenta explodir um caixa pra levar de **$50k a $150k**.\n` +
            `- O alarme toca na hora. A Polícia tiene **2 MINUTOS** pra clicar no botão de impedir.\n` +
            `- Se a polícia clicar, rola a sorte (50% de fugir rico, 50% de ir preso). Cooldown de 20 min (5m VIP).\n\n` +
            `🚚 **Roubo ao Carro Forte (\`k carroforte\`):**\n` +
            `- O evento Endgame! Exige que você compre uma **C4 Militar** no Mercado Negro.\n` +
            `- Demora 3 minutos pro cofre abrir e os Ladrões da cidade podem entrar no bonde pra ajudar.\n` +
            `- Se a PM interceptar, rola tiro: Se o PM deitar o ladrão, ele pega **2 HORAS** de Alcatraz. Se o bonde sobreviver, dividem de $500k a $1.5 Milhão!\n\n` +
            `🧼 **Grana Suja e Lavagem:**\n` +
            `- Muita grana do crime entra **suja** (contrabando, operação de fac...). Você não pode gastar direto.\n` +
            `- Use **\`k lavar <valor>\`** na lavanderia NPC (taxa de 40%) ou marque alguém de facção de **Lavagem** (\`k lavar <valor> @lavador\`) pra lavar mais barato (15%).\n` +
            `- 🚓 **Cuidado:** A PM apreende metade da sua grana suja quando te enquadra ou te revista!\n\n` +
            `🤕 **Ficou Ferido?:**\n` +
            `- Falhar roubo ou operação tem 25% de chance de te deixar **ferido por 15 min**: não pode roubar/operar e trampar rende metade.\n` +
            `- Chama um Médico (\`k tratar @medico [valor]\`) pra zerar o B.O na hora!\n\n` +
            `🔒 **A Prisão (Alcatraz):**\n` +
            `Rodou no enquadro ou no assalto? Fica sem comandos por 30 mins (ou mais). Suas saídas:\n` +
            `- **\`k fuga\`:** 30% de chance de escapar. Se falhar, toma **+15 minutos** de pena!\n` +
            `- **\`k subornar @PM [valor]\`:** Ofereça propina na cela. Se ele recusar, o juiz te dá mais tempo de cadeia.`;
        }
        else if (escolha === 'policia') {
            texto = `🚓 **A LEI E A ORDEM (Visão do PM)**\n\n` +
            `Você quer limpar a cidade? As regras do distintivo são claras:\n\n` +
            `🔰 **A Contratação:** Você não vira PM sozinho. O Delegado da cidade tiene que te dar o distintivo usando \`k contratar @seu_nome\`. Sem isso, o bot te barra.\n` +
            `⚠️ **Quer sair da PM?** Troca de emprego no \`k trabalhar\` que você devolve o distintivo na hora e pode até fundar facção!\n\n` +
            `🚨 **O Enquadro de Rua (\`k prender @suspeito\`):**\n` +
            `- Você só enquadra Ladrão ou Hacker. A abordagem tiene **60% de chance** de sucesso (5 min de cansaço se falhar).\n` +
            `- Se prender: O cara vai pra Alcatraz por 1 hora e você confisca **metade de toda a grana suja** dele como evidência!\n\n` +
            `🕵️ **A Revistada (\`k revistar @cidadão\`, 10 min):**\n` +
            `- PM procura grana suja no bolso: 60% de achar e 30% de conseguir apreender o que achou.\n` +
            `- Grana apreendida vira evidência (some da economia) e a Delegacia te paga um bônus!\n\n` +
            `🚔 **Impedindo o Caos (Botões Vermelhos):**\n` +
            `Fica de olho no chat! Quando Ladrões usarem \`k assaltar_caixa\`, \`k carroforte\` ou \`k contrabandear\`, o Kibo vai apitar. Clica no botão de INTERCEPTAR rápido pra trocar tiro com os bandidos, faturar recompensas e ainda apreender a grana suja deles!`;
        }
        else if (escolha === 'servicos') {
            texto = `🧨 **SERVIÇOS E TRAMPOS NOVOS**\n\n` +
            `As novas profissões trocam serviço entre jogadores por grana. Pega a visão de cada uma:\n\n` +
            `🩺 **Médico (\`k tratar @ferido [valor]\`):**\n` +
            `- Quem tá **ferido** (15 min) não pode roubar, operar nem trampar direito.\n` +
            `- O Médico propõe o valor, o ferido aceita nos botões, e o B.O do ferimento zera na hora!\n\n` +
            `⚖️ **Advogado (\`k advogar @preso [valor]\`):**\n` +
            `- Tira tempo de cadeia de quem tá preso em Alcatraz.\n` +
            `- Redução base de **30% da pena** + **3% por nível de Lábia** do advogado!\n\n` +
            `👮 **Segurança Privado (\`k segurar @cliente [valor]\`):**\n` +
            `- Ativa a proteção **\`protegido\` por 30 min** no cliente: ninguém consegue roubar ele no período.\n\n` +
            `🧨 **Sequestrador (\`k sequestrar @rico\`):**\n` +
            `- Só rende em quem tem **$30.000+** na conta (saldo da carteira, não o banco).\n` +
            `- Resgate = **25% do saldo** (mín. $10k). A vítima tem 60s pra decidir: **paga** ou **chama a ROTA**.\n` +
            `- Se chamar a ROTA: 50/50 — sequestrador pega **1 hora** de Alcatraz ou foge sem nada.\n` +
            `- Cooldown de 30 min pro sequestrador.\n\n` +
            `📦 **Contrabandista (\`k contrabandear\`):**\n` +
            `- Lucro de **$8k a $15k**, mas **70% sai sujo** (lava com \`k lavar\`).\n` +
            `- Se a fiscal pegar: você paga multa e a PM vê o alerta com botão de **INTERCEPTAR** por 60s.\n` +
            `- Se a PM te alcançar: 1 hora de cadeia + apreensão de 50% da sua grana suja. Se ela cansar, fica 10 min fora.`;
        }
        else if (escolha === 'cassino') {
            texto = `🎰 **CASSINO CLANDESTINO E APOSTAS**\n\n` +
            `Tá com sorte ou com vício? Multiplica (ou perde tudo) com os jogos da facção:\n\n` +
            `- **\`k tigrinho [valor]\`**: Jogo da maquininha clássico. Gira os slots e torce pra alinhar os emojis. Se alinhar 3 iguais, ganha muito. Se cair o bônus, multiplica 10x!\n` +
            `- **\`k crash [valor]\`**: O gráfico vai subindo e multiplicando sua aposta na tela. Tem que clicar pra SAIR antes que a bolha estoure, senão perdeu tudo.\n` +
            `- **\`k mines [valor]\`**: Campo minado do desespero. Clica nas casas pra achar o prêmio e sacar, mas se clicar na bomba, a casa cai.\n` +
            `- **\`k coinflip [valor]\`**: 50/50 purinho. Cara ou coroa contra o bot. Dobra ou chora.\n` +
            `- **Airdrop:** Evento surpresa! Uma caixa cai de paraquedas no chat aleatoriamente. O primeiro que for rápido pra clicar leva a grana.`;
        }
        else if (escolha === 'lojas') {
            texto = `🛒 **MERCADO, LOJAS E EMPRESAS**\n\n` +
            `Quer dominar o monopólio da cidade e gerar dinheiro parado? Se liga:\n\n` +
            `- **As Empresas (\`k empresas\`):** Compre um negócio e gere "renda passiva". De tempo em tempo você clica pra recolher os lucros sem fazer nada!\n` +
            `- **\`k loja\`**: A biqueira oficial do Kibo pra comprar itens úteis e legais.\n` +
            `- **\`k mercadonegro\`**: Feira livre do crime! Aqui o bot vende itens ilegais restritos (como a **C4**) e os jogadores também colocam suas próprias empresas inflacionadas pra vender!\n` +
            `- **\`k mercado\`**: Venda seus itens pra outros jogadores no mercado de pulgas.\n` +
            `- **Inventário (\`k comprar\` e \`k usar\`):** Compre itens e abra a mochila pra consumir as paradas que você tem guardadas.`;
        }
        else if (escolha === 'social') {
            texto = `🫂 **PERFIL E RESPEITO NA RUA**\n\n` +
            `Pra virar lenda na cidade, você tiene que deixar sua marca:\n\n` +
            `- **O Seu Registro (\`k perfil\`):** Puxa a sua ficha criminal, seu dinheiro, habilidades, emprego atual e — se você for de facção — o **chip da sua facção** estampado no cartão!\n` +
            `- **A Sua História (\`k bio [texto]\`):** Digita seu papo reto que vai ficar estampado no seu perfil.\n` +
            `- **Progresso (\`k habilidades\`):** Veja os níveis das suas skills, se você tá brabo no combate ou se ainda é novato.\n\n` +
            `🗯️ **Ações de Quebrada:**\n` +
            `Quer chamar o parceiro pra resenha? Usa os comandos de reação:\n` +
            `\`k beijar @user\`, \`k abracar @user\`, \`k socar @user\`, \`k chutar @user\`, \`k morder @user\`.\n` +
            `O bot joga um gif combinando com a emoção na hora!`;
        }
        else if (escolha === 'vip') {
            texto = `💎 **AS VANTAGENS DO VIP**\n\n` +
            `Quem apoia e banca o servidor de verdade tiene caminho livre pra fazer dinheiro absurdo e muito mais rápido:\n\n` +
            `⚡ **Sem Perder Tempo na Rua:**\n` +
            `- O tempo de descanso pra trampar no \`k executar\` cai pela metade! De 10 minutos para apenas **5 minutos**.\n\n` +
            `🧨 **O Crime Voa:**\n` +
            `- Pra quem é Ladrão VIP, o preparo pra estourar banco (\`k assaltar_caixa\`) e roubar blindado (\`k carroforte\`) despenca absurdamente. De 20/30 minutos sofridos de espera para apenas **5 minutos**!\n\n` +
            `Quer as chaves da cidade e colar de VIP? Dá um salve no Dono do Servidor e pega a visão de como apoiar o projeto!`;
        }

        // Atualiza a própria mensagem mantendo o menu lá embaixo pra ele continuar navegando!
        await interaction.update({ content: texto, components: [interaction.message.components[0]] });
    }
};