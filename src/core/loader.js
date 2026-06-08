import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function loadCommands(client) {
    const modulesPath = path.join(__dirname, '../modules');
    const folders = fs.readdirSync(modulesPath);

    for (const folder of folders) {
        const cmdPath = path.join(modulesPath, folder, 'commands');
        if (!fs.existsSync(cmdPath)) continue;
        
        const commandFiles = fs.readdirSync(cmdPath).filter(f => f.endsWith('.js'));
        for (const file of commandFiles) {
            const command = (await import(`../modules/${folder}/commands/${file}`)).default;
            client.commands.set(command.name, command);
        }
    }
}

export async function loadComponents(client) {
    const modulesPath = path.join(__dirname, '../modules');
    const folders = fs.readdirSync(modulesPath);

    for (const folder of folders) {
        const compPath = path.join(modulesPath, folder, 'components');
        if (!fs.existsSync(compPath)) continue;

        const compFiles = fs.readdirSync(compPath).filter(f => f.endsWith('.js'));
        for (const file of compFiles) {
            const component = (await import(`../modules/${folder}/components/${file}`)).default;
            client.components.set(component.customId, component);
        }
    }
}

export async function loadEvents(client) {
    const eventsPath = path.join(__dirname, '../events');
    if (!fs.existsSync(eventsPath)) return;
    
    const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));
    for (const file of eventFiles) {
        const event = (await import(`../events/${file}`)).default;
        if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
        else client.on(event.name, (...args) => event.execute(...args, client));
    }
}