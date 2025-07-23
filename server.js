import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {getActiveLobbies, addNewLobby, addUser} from './database.js';
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
    const ownerId = req.body.userId;
    if (!ownerId){
        return res.status(400).json({lobbyId: -1, ownerId: false});
    }
    try{
        const activeLobbies = await getActiveLobbies();

        const maxRetry = process.env.MAX_RETRY_MAKE_LOBBY || 20;
        let requestedLobby = makeLobbyID();
        let retry = 0;

        while (retry < maxRetry && activeLobbies.has(requestedLobby)){
            requestedLobby = makeLobbyID();
            retry += 1;
        }

        if (retry >= maxRetry){
            return res.status(503).json({lobbyId: -1, ownerId:true, connectionSuccess: true});
        }

        await addNewLobby(requestedLobby, ownerId);
        await addUser(requestedLobby, ownerId);
        return res.status(201).json({lobbyId: requestedLobby});

    }catch(err){
        res.status(503).json({lobbyId:-1, ownerId:true, connectionSuccess: false});
        console.log("ERROR IN CONNECTING TO DB TO MAKE LOBBY AND ADD USER: ", err);
    }
});

app.post('/lobbies/:lobbyId/join', async(req, res)=>{
    const lobbyId = req.params.lobbyId;
    const userId = req.body.userId;

    try{
        const activeLobbies = await getActiveLobbies()
        if (!activeLobbies.has(lobbyId)){
            return res.status(400).json({lobbyExists: false})
        }
        await addUser(lobbyId, userId);
        res.status(201).json({lobbyExists: true})
    } catch(err){
        console.log("ERROR IN ADDING USER TO DB: ", err);
        res.status(503).json({lobbyExists: true});
    }
})

app.get('/lobbies/:lobbyId', async (req, res)=>{
    const lobbyId = req.params.lobbyId;
    const activeLobbies = await getActiveLobbies();
    if (activeLobbies.has(lobbyId)){
        res.status(200).sendFile(path.join(__dirname, 'public', 'lobbyRoom.html'));
    } else{
        res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
    }
    
});
