import cron from 'node-cron';
import { pool } from '../database.js';

const cleanupLockKey = 12123;

async function deleteExpiredLobbies(io) {
    const client = await pool.connect();
    let lockAcquired = false;
    try {
        const lockResult = await client.query('SELECT pg_try_advisory_lock($1)', [cleanupLockKey]);
        lockAcquired = lockResult.rows[0].pg_try_advisory_lock;

        if (!lockAcquired) {
            return;
        }

        const selectQuery = `
            SELECT lobbyid FROM lobby WHERE 
            (starttime IS NULL AND createtime < NOW() - INTERVAL '30 minutes')
            OR
            (starttime IS NOT NULL AND starttime + (timelimit * INTERVAL '1 minute') + INTERVAL '30 minutes' < NOW());
        `;
        
        const { rows } = await client.query(selectQuery);

        if (rows.length === 0) {
            return;
        }

        const lobbyIdsToDelete = rows.map(lobby => lobby.lobbyid);

        await Promise.all(lobbyIdsToDelete.map(async (lobbyId) => {
            io.to(lobbyId).emit('lobby-deletion');
            const sockets = await io.in(lobbyId).fetchSockets();
            sockets.forEach(socket => socket.disconnect(true));
        }));

        const deleteQuery = 'DELETE FROM lobby WHERE lobbyid = ANY($1::text[])';
        await client.query(deleteQuery, [lobbyIdsToDelete]);

    } catch (err) {
        console.error('Error during lobby cleanup:', err);
    } finally{
        if (lockAcquired){
            await client.query('SELECT pg_advisory_unlock($1)', [cleanupLockKey])
        }
        client.release();
    }
}

export function startCleanupService(io){
    cron.schedule('* * * * *', ()=>deleteExpiredLobbies(io));
};
