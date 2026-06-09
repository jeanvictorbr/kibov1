import { Client, GatewayIntentBits, Partials, Collection } from 'discord.js';
import { execSync } from 'child_process';
import { loadCommands, loadEvents, loadComponents } from './core/loader.js';
import 'dotenv/config';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [Partials.Channel, Partials.Message],
    sweepers: {
        messages: { interval: 3600, lifetime: 1800 },
        users: { interval: 3600, filter: () => user => user.bot }
    }
});

client.commands = new Collection();
client.components = new Collection();

(async () => {
    try {
        // Sincroniza o banco de dados na hora de ligar
        console.log("Sincronizando tabelas do PostgreSQL...");
        try {
            execSync("npx prisma db push --accept-data-loss", { stdio: 'inherit' });
        } catch (dbError) {
            console.error("Aviso no Banco de Dados (Verifique sua DATABASE_URL se os comandos falharem).");
        }

        await loadCommands(client);
        await loadComponents(client);
        await loadEvents(client);
        await client.login(process.env.TOKEN);
        console.log("Kibo Engine online, componentes carregados.");
    } catch (err) {
        console.error("Falha ao iniciar:", err);
    }
})();