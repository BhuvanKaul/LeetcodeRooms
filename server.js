import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {getActiveLobbies, addNewLobby, addUser, removeUser, getUsers} from './database.js';
import { makeLobbyID } from './backend_logic.js';
import dotenv from 'dotenv';
import http from 'http';
import {Server} from 'socket.io';
import cors from 'cors';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const socketToUser = new Map();

app.use(express.json());
app.use(express.static('public'));
app.use(cors());


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
        return res.status(201).json({lobbyId: requestedLobby});

    }catch(err){
        res.status(503).json({lobbyId:-1, ownerId:true, connectionSuccess: false});
        console.log("ERROR IN CONNECTING TO DB TO MAKE LOBBY AND ADD USER: ", err);
    }
});

app.post('/lobbies/:lobbyId/join', async(req, res)=>{
    const lobbyId = req.params.lobbyId;
    const userId = req.body.userId;
    const name = req.body.name;

    try{
        const activeLobbies = await getActiveLobbies()
        if (!activeLobbies.has(lobbyId)){
            return res.status(400).json({lobbyExists: false})
        }
        await addUser(lobbyId, userId, name);
        res.status(201).json({lobbyExists: true})
    } catch(err){
        console.log("ERROR IN ADDING USER TO DB: ", err);
        res.status(503).json({lobbyExists: true});
    }
})

// WebSockets CODE

io.on("connection", (socket) =>{
    
    socket.on("joinLobby", async({lobbyId, userId, name}) => {
        socket.join(lobbyId);
        socketToUser.set(socket.id, {userId, lobbyId, name});
        io.to(lobbyId).emit('userJoined', {name});
        const users =  await getUsers(lobbyId);
        io.to(lobbyId).emit('participantsUpdate', {users})
    });

    socket.on("chatMsg", ({lobbyId, name, message}) =>{
        io.to(lobbyId).emit("chatMsg", {name, message});
    });

    socket.on("disconnect", async ()=>{
        const info = socketToUser.get(socket.id);
        if (info){
            const {userId, lobbyId, _ } = info;
            await removeUser(userId, lobbyId);
            socketToUser.delete(socket.id);
            const users = await getUsers(lobbyId);
            io.to(lobbyId).emit('participantsUpdate', {users})
        }
    });
})


server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
})