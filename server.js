import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {getActiveLobbies, addNewLobby} from './database.js';
import { makeLobbyID } from './backend_logic.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
})

app.post('/lobbies', async (req, res)=> {
    const activeLobbies = await getActiveLobbies();

    let maxRetry = process.env.MAX_RETRY_MAKE_LOBBY;
    let requestedLobby = makeLobbyID();
    let retry = 0;

    while (retry < maxRetry && activeLobbies.has(requestedLobby)){
        requestedLobby = makeLobbyID();
        retry += 1;
    }

    if (retry >= maxRetry){
        return res.status(503).json({id: -1});
    }

    addNewLobby(requestedLobby);
    return res.status(201).json({id: requestedLobby});
});

app.get('/lobbies/:id', async (req, res)=>{
    const lobbyId = req.params.id;
    const activeLobbies = await getActiveLobbies();
    if (activeLobbies.has(lobbyId)){
        res.status(200).sendFile(path.join(__dirname, 'public', 'lobbyRoom.html'));
    } else{
        res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
    }
    
});
