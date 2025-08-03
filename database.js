import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();


const db = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
})

db.connect();

async function getActiveLobbies() {
    let query = `select lobbyID from lobby;`;
    let dbRes = await db.query(query);
    dbRes = dbRes.rows;
    let activeIDs = new Set();
    for (const resRow of dbRes){
        activeIDs.add(resRow.lobbyid);
    }
    return activeIDs;
}

async function addNewLobby(lobbyID, ownerId) {
    let query = 'insert into lobby(lobbyid, ownerid) values($1, $2);';
    await db.query(query, [lobbyID, ownerId]);
}

async function addUser(lobbyId, userId){
    const query = 'insert into lobby_members(lobbyid, userid) values($1, $2) on conflict (lobbyid, userid) do nothing';
    await db.query(query, [lobbyId, userId]);
}

async function removeUser(userId, lobbyId) {
    let query = 'delete from lobby_members where lobbyid = $1 and userid = $2;';
    await db.query(query, [lobbyId, userId]);
}

async function getUsers(lobbyId){
    let query = 'select userid from lobby_members where lobbyid=$1;';
    const res = await db.query(query, [lobbyId]);
    const users = [];
    for(const row of res.rows){
        users.push(row.userid);
    }
    return users;
}

export {getActiveLobbies, addNewLobby, addUser, removeUser, getUsers};