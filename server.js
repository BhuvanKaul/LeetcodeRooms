import express from 'express';
import {getActiveLobby, addNewLobby} from './database.js';
import { makeLobbyID } from './backend_logic.js';
import dotenv from 'dotenv';

dotenv.config();


const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
})

app.post('/lobby', async (req, res)=> {
    const activeLobby = await getActiveLobby();

    let maxRetry = process.env.MAX_RETRY_MAKE_LOBBY;
    let requestedLobby = makeLobbyID();
    let retry = 0;

    while (retry < maxRetry && activeLobby.has(requestedLobby)){
        requestedLobby = makeLobbyID();
        retry += 1;
    }

    if (retry >= maxRetry){
        return res.status(503).json({id: -1});
    }

    addNewLobby(requestedLobby);
    return res.status(201).json({id: requestedLobby});
});