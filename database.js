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

async function getActiveLobby() {
    let query = `select lobbyID from lobby;`;
    try{
        let dbRes = await db.query(query);
        dbRes = dbRes.rows;
        let activeIDs = new Set();
        for (const resRow of dbRes){
            activeIDs.add(resRow.lobbyid);
        }
        return activeIDs;
    }
    catch(err){
        console.log("ERROR IN GETTING ACTIVE LOBBY IDS: ", err);
    }
}

function addNewLobby(lobbyID) {
    let query = 'insert into lobby values($1);'

    db.query(query, [lobbyID]);
}

export {getActiveLobby, addNewLobby};