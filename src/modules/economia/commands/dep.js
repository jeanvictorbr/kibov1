import depositar from './depositar.js';

export default {
    name: 'dep', // k dep
    execute: async (message, args, client, reply, targetUser) => {
        // Passa o argumento (ex: 1000) para o comando original
        return depositar.execute(message, args, client, reply, targetUser);
    }
};