import cron from 'node-cron';
import { pool } from '../database.js';

async function deleteExpiredLobbies(io, socketToUser, disconnectTimers) {

    try{
    
        const selectQuery = `
                            select lobbyid from lobby where 
                            (starttime is null and createtime < now() - interval '30 minutes')
                            or
                            (starttime is not null and starttime + (timelimit * interval '1 minute') + interval '30 minutes' < now());
        `
        const { rows } = await pool.query(selectQuery);

        if (rows.length === 0){
            return;
        }

        const lobbyIdsToDelete = rows.map(lobby => lobby.lobbyid);

        lobbyIdsToDelete.forEach(lobbyId => {
            io.to(lobbyId).emit('lobby-deletion');

            const clientsInRoom = io.sockets.adapter.rooms.get(lobbyId);
            if (clientsInRoom) {
                clientsInRoom.forEach(socketId => {
                    const userInfo = socketToUser.get(socketId);
                    if (userInfo) {
                        socketToUser.delete(socketId);
                        const pendingTimer = disconnectTimers.get(userInfo.userId);
                        if (pendingTimer) {
                            clearTimeout(pendingTimer);
                            disconnectTimers.delete(userInfo.userId);
                        }
                    }
                    
                    const socket = io.sockets.sockets.get(socketId);
                    if (socket) {
                        socket.leave(lobbyId);
                    }
                });
            }
        });

        const deleteQuery = 'delete from lobby where lobbyid = any($1::text[])';
        await pool.query(deleteQuery, [lobbyIdsToDelete]);

    } catch(err){
        //do nothing
    }
}

export function startCleanupService(io, socketToUser, disconnectTimers){
    cron.schedule('* * * * *', ()=>deleteExpiredLobbies(io, socketToUser, disconnectTimers));
};  