import depositar from './depositar.js';

export default {
    name: 'depall', // k depall
    execute: async (message, args, client, reply, targetUser) => {
        // Força o argumento 'ALL' para depositar tudo
        const argsAll = ['ALL']; 
        return depositar.execute(message, argsAll, client, reply, targetUser);
    }
};