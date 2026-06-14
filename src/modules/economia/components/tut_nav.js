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
        else if (escolha === 'trampos') {
            texto = `🏢 **EMPREGOS E TRAMPOS (k executar)**\n\n` +
            `Usa o \`k trabalhar\` pra escolher uma profissão. Cada uma tem seu esquema quando você usa o **\`k executar\`** (pode usar a cada 10 min, ou 5 min se for VIP):\n\n` +
            `👷 **Cidadão Honesto:** Rende entre $1.000 e $3.000. **0% de Risco.** Trampo seguro.\n` +
            `🚓 **Oficial de Polícia:** Rende entre $2.000 e $5.000. Tem 15% de chance de dar B.O na patrulha e você perder dinheiro com médico ou viatura.\n` +
            `🥷 **Ladrão de Rua:** Rende entre $3.000 e $7.000. Tem 30% de chance de você apanhar na rua e perder a grana.\n` +
            `💻 **Hacker:** Rende entre $4.000 e $9.000. Lucro gigante, mas tem 35% de chance de rastrearem seu IP e você perder equipamento.`;
        } 
        else if (escolha === 'crime') {
            texto = `🥷 **A VIDA DO CRIME E O SUBMUNDO**\n\n` +
            `Escolheu a vida loka? Então pega a visão de como a rua funciona:\n\n` +
            `🧨 **O Grande Assalto (\`k assaltar_caixa\`):**\n` +
            `- Comando exclusivo de Ladrão. Você tenta explodir um caixa pra levar de **$50k a $150k**.\n` +
            `- Tem cooldown (espera) de **20 minutos** (VIP espera só 5 min).\n` +
            `- O alarme toca na hora e o chat apita pras viaturas. A Polícia tem **2 MINUTOS** pra chegar.\n` +
            `- Se a polícia clicar em IMPEDIR, rola a sorte (50% de chance de você dar fuga e ficar rico, 50% de chance de tomar um cacete e ir preso).\n\n` +
            `🔒 **A Prisão (Alcatraz):**\n` +
            `Foi pego no assalto ou tomou um Enquadro na rua? Você vai mofar **30 minutos** sem poder usar NENHUM comando no bot. Suas únicas saídas são:\n` +
            `- **A Fuga (\`k fuga\`):** 30% de chance de dar certo. Se conseguir, tá livre. Se falhar, sua pena aumenta em **+15 minutos** e você fica 10 min sem poder tentar de novo.\n` +
            `- **A Corrupção (\`k subornar @policial [valor]\`):** Ofereça dinheiro sujo pela cela. Se o PM aceitar, você tá solto. Se ele recusar, o juiz te dá uma pena extra surpresa (entre 2 e 8 minutos).`;
        }
        else if (escolha === 'policia') {
            texto = `🚓 **A LEI E A ORDEM (Visão do PM)**\n\n` +
            `Você quer limpar a cidade? As regras do distintivo são claras:\n\n` +
            `🔰 **A Contratação:** Você não vira PM sozinho. O Delegado da cidade tem que te dar o distintivo usando \`k contratar @seu_nome\`. Sem isso, o bot te barra.\n\n` +
            `🚨 **O Enquadro de Rua (\`k prender @suspeito\`):**\n` +
            `- Você só pode enquadrar quem tem emprego de Ladrão ou Hacker.\n` +
            `- A abordagem tem **60% de chance** de sucesso. Se você prender o mano:\n` +
            `  1. Ele vai de base pra Alcatraz por **30 minutos**.\n` +
            `  2. Você confisca (rouba) **10% de todo o dinheiro** que ele tem na mão e guarda no seu bolso!\n` +
            `- Mas se ele fugir do seu enquadro, você fica exausto e pega um cooldown de **5 minutos** sem poder prender ninguém.\n\n` +
            `🚔 **Impedindo o Assalto de Caixa:**\n` +
            `Fica de olho no chat! Quando um maluco assaltar o banco, um botão vermelho de "IMPEDIR ASSALTO" aparece por apenas **2 minutos**. Clica rápido! Se ganhar a disputa de tiro (50%), você ganha 30% da grana do cofre como recompensa.`;
        }
        else if (escolha === 'cassino') {
            texto = `🎰 **CASSINO CLANDESTINO E APOSTAS**\n\n` +
            `Tá com sorte ou com vício? Multiplica (ou perde tudo) com os jogos da facção:\n\n` +
            `- **\`k tigrinho [valor]\`**: Jogo da maquininha clássico. Gira os slots e torce pra alinhar os emojis. Se alinhar 3 iguais, ganha muito. Se cair o bônus, multiplica 10x!\n` +
            `- **\`k crash [valor]\`**: O gráfico vai subindo e multiplicando sua aposta na tela. Tem que clicar pra SAIR antes que a bolha estoure, senão perdeu tudo.\n` +
            `- **\`k mines [valor]\`**: Campo minado do desespero. Clica nas casas pra achar o prêmio e sacar, mas se clicar na bomba, a casa cai.\n` +
            `- **\`k coinflip [valor]\`**: 50/50 purinho. Cara ou coroa contra o bot. Dobra ou chora.\n` +
            `- **Airdrop:** Evento surpresa! Uma caixa cai de paraquedas no chat aleatoriamente. O primeiro que for rápido pra clicar leva a grana que tiver lá dentro.`;
        }
        else if (escolha === 'lojas') {
            texto = `🛒 **MERCADO, LOJAS E EMPRESAS**\n\n` +
            `Quer dominar o monopólio da cidade e gerar dinheiro parado? Se liga:\n\n` +
            `- **As Empresas (\`k empresas\`):** Em vez de ficar só no crime, compre um negócio (Lava-jato, Lojinha, Cassino, etc.). Elas geram "renda passiva". De tempo em tempo você clica pra recolher os lucros!\n` +
            `- **\`k loja\`**: A biqueira oficial do Kibo pra comprar itens úteis.\n` +
            `- **\`k mercadonegro\`**: Tamo escondendo os equipamentos restritos aqui, cuidado com a ROTA.\n` +
            `- **\`k mercado\`**: Aqui é livre! Venda seus itens pra outros jogadores no mercado de pulgas.\n` +
            `- **Inventário (\`k comprar\` e \`k usar\`):** Compre e consuma as paradas que você tem guardadas.`;
        }
        else if (escolha === 'social') {
            texto = `🫂 **PERFIL E RESPEITO NA RUA**\n\n` +
            `Pra virar lenda na cidade, você tem que deixar sua marca:\n\n` +
            `- **O Seu Registro (\`k perfil\`):** Puxa a sua ficha criminal, seu dinheiro, quantas horas você tem de rua e seu emprego atual.\n` +
            `- **A Sua História (\`k bio [texto]\`):** Digita seu papo reto que vai ficar estampado no seu perfil.\n` +
            `- **Progresso (\`k habilidades\`):** Veja os níveis das suas skills, se você tá brabo no combate ou se ainda é novato.\n\n` +
            `🗯️ **Ações de Quebrada:**\n` +
            `Quer chamar o parceiro pra resenha? Usa os comandos de reação:\n` +
            `\`k beijar @user\`, \`k abracar @user\`, \`k socar @user\`, \`k chutar @user\`, \`k morder @user\`.\n` +
            `O bot joga um gif combinando com a emoção na hora!`;
        }
        else if (escolha === 'vip') {
            texto = `💎 **AS VANTAGENS DO VIP**\n\n` +
            `Quem apoia e banca o servidor de verdade tem caminho livre pra fazer dinheiro absurdo e muito mais rápido:\n\n` +
            `⚡ **Sem Perder Tempo na Rua:**\n` +
            `- O tempo de descanso pra trampar no \`k executar\` cai pela metade! De 10 minutos para apenas **5 minutos**.\n\n` +
            `🧨 **O Crime Voa:**\n` +
            `- Pra quem é Ladrão VIP, o preparo para um novo grande assalto (\`k assaltar_caixa\`) despenca absurdamente. De 20 minutos sofridos de espera para apenas **5 minutos**!\n\n` +
            `Quer as chaves da cidade e colar de VIP? Dá um salve no Dono do Servidor e pega a visão de como apoiar o projeto!`;
        }

        // Atualiza a própria mensagem mantendo o menu lá embaixo pra ele continuar navegando!
        await interaction.update({ content: texto, components: [interaction.message.components[0]] });
    }
};