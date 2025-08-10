import { Pool } from 'pg';
import format from 'pg-format';
import dotenv from 'dotenv';
dotenv.config();


const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
})


async function getActiveLobbies() {
    let query = `select lobbyID from lobby;`;
    let dbRes = await pool.query(query);
    dbRes = dbRes.rows;
    let activeIDs = new Set();
    for (const resRow of dbRes){
        activeIDs.add(resRow.lobbyid);
    }
    return activeIDs;
}

async function addNewLobby(lobbyID, ownerId) {
    let query = 'insert into lobby(lobbyid, ownerid) values($1, $2);';
    await pool.query(query, [lobbyID, ownerId]);
}

async function addUser(lobbyId, userId, name){
    const query = 'insert into lobby_members(lobbyid, userid, name) values($1, $2, $3) on conflict (lobbyid, userid) do nothing';
    await pool.query(query, [lobbyId, userId, name]);
}

async function removeUser(userId, lobbyId) {
    let query = 'delete from lobby_members where lobbyid = $1 and userid = $2;';
    await pool.query(query, [lobbyId, userId]);
}

async function getUsers(lobbyId){
    let query = 'select name from lobby_members where lobbyid=$1;';
    const res = await pool.query(query, [lobbyId]);
    const users = [];
    for(const row of res.rows){
        users.push(row.name);
    }
    return users;
}

async function getOwner(lobbyId) {
    let query = 'select ownerid from lobby where lobbyid = $1;';
    const res = await pool.query(query, [lobbyId]);
    return res.rows;
}

async function addLobbyDetails(lobbyId, timeLimit){
    let query = 'update lobby set timelimit = $1, starttime = now() where lobbyid = $2;';
    await pool.query(query, [timeLimit, lobbyId]);
}

async function addQuestions(lobbyId, questions) {
    const values = questions.map(link => [lobbyId, link]);
    const query = format(
        'insert into questions(lobbyid, questionlink) values %L on conflict (lobbyid, questionlink) do nothing;',
        values
    );

    await pool.query(query);
}

async function getQuestions(lobbyId){
    const query = 'select questionlink from questions where lobbyid = $1;';
    const res = await pool.query(query, [lobbyId]);
    const data = res.rows;
    const questions = [];
    for (const row of data){
        questions.push(row.questionlink);
    }
    return questions;
}

async function isStarted(lobbyId){
    const query = 'select starttime from lobby where lobbyid = $1;';
    const res = await pool.query(query, [lobbyId]);
    const data = res.rows[0];
    if (data.starttime){
        return true
    }
    return false;
}

async function getStartTime(lobbyId){
    const query = 'select starttime from lobby where lobbyid = $1;';
    const res = await pool.query(query, [lobbyId]);
    const data = res.rows[0];
    return data.starttime;

}

async function getTimeLimit(lobbyId) {
    const query = 'select timelimit from lobby where lobbyid = $1;';
    const res = await pool.query(query, [lobbyId]);
    const data = res.rows[0];
    return data.timelimit;
}

export {getActiveLobbies, addNewLobby, addUser, removeUser, getUsers, getOwner, addLobbyDetails, addQuestions, getQuestions, isStarted, getStartTime, getTimeLimit};