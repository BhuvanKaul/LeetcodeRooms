import { removeUser, getUsers } from "../database.js";


export function redisDisconnectCleanup(io, redisClient, reconnectGracePeriod) {
    setInterval(async () => {
        try {
            const disconnectedKeys = await redisClient.keys('disconnect:*');
            if (disconnectedKeys.length === 0) return;

            for (const key of disconnectedKeys) {
                const disconnectInfoJSON = await redisClient.get(key);
                if (!disconnectInfoJSON) continue;

                const { name, lobbyId, disconnectTime } = JSON.parse(disconnectInfoJSON);
                const userId = key.split(':')[1];

                if (Date.now() - disconnectTime > reconnectGracePeriod) {
                    
                    await removeUser(userId, lobbyId);
                    const users = await getUsers(lobbyId);
                    io.to(lobbyId).emit("leaveLobby", { name });
                    io.to(lobbyId).emit('participantsUpdate', { users });

                    await redisClient.del(key);
                }
            }
        } catch (err){
            logger.error('Error during lobby cleanup service:', err);
        }
    }, 5000);
}