import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {getActiveLobbies, addNewLobby, addUser, removeUser, getUsers, 
        getOwner, addLobbyDetails, addQuestions, getQuestions, isStarted, 
        getStartTime, getTimeLimit, getSolvedQuestions, addSubmittedQuestion, getLeaderboard, generateQuestions} from './database.js';
import { makeLobbyID, getLastSubmission } from './backend_logic.js';
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
});

app.get('/lobbies/:lobbyId/owner', async(req, res)=>{
    const lobbyId = req.params.lobbyId;
    try{
        const ownerId = await getOwner(lobbyId);
        if (ownerId.length === 0){
            res.status(400).json({ message: `Lobby with ID ${lobbyId} not found.` });
        }
        res.status(200).json({ownerId: ownerId[0].ownerid})
    } catch(err){
        res.status(503).json({ message: 'Service unavailable or internal server error.' });
    }
});

 
app.post('/lobbies/:lobbyId/info', async(req, res)=>{
    const lobbyId = req.params.lobbyId;
    const lobbyTopics = req.body.lobbyTopics;
    const numberOfQues = req.body.numberOfQues;
    const timeLimit = req.body.timeLimit;
    const difficulty = req.body.difficulty;

    const questions = await generateQuestions(lobbyTopics, numberOfQues, difficulty);
    try{
        await addQuestions(lobbyId, questions);
        await addLobbyDetails(lobbyId, timeLimit);
        res.status(201).json({success: true});
    } catch(err){
        console.log(err);
        res.status(503).json({success: false});
    }

});

app.get('/lobbies/:lobbyId/info', async(req, res)=>{
    const lobbyId = req.params.lobbyId;
    try{
        const questions = await getQuestions(lobbyId);
        const startTime = await getStartTime(lobbyId);
        const timeLimit = await getTimeLimit(lobbyId);
        res.status(200).json({questions, startTime, timeLimit});
    } catch(err){
        res.status(503).end();
    }
});

app.get('/lobbies/:lobbyId/start', async(req, res)=>{
    const lobbyId = req.params.lobbyId;
    try{
        const start = await isStarted(lobbyId);
        res.status(200).json({start: start});
    } catch(err) {
        res.status(503).json({start: null});
    }
})

app.get('/lobbies/:lobbyId/solvedQuestions', async(req, res)=>{
    const lobbyId = req.params.lobbyId;
    const userId = req.query.userId;
    try{
        const solvedQuestions = await getSolvedQuestions(lobbyId, userId);
        res.status(200).json({solvedQuestions: solvedQuestions});
    } catch(err){
        res.status(503).json({error: 'Could not get questions'});
    }
});

app.get('/lastSubmission', async(req, res)=>{
    const userName = req.query.userName;

    try{
        const lastQuestion = await getLastSubmission(userName);
        res.status(200).json({lastQuestion});
    } catch(err){
        res.status(400).json({message: 'Bad User Name'})
    }
});

app.post('/lobbies/:lobbyId/submit', async(req, res)=>{
    const lobbyId = req.params.lobbyId;
    const userId = req.body.userId;
    const question = req.body.question;

    try{
        await addSubmittedQuestion(lobbyId, userId, question);
        res.status(200).json({submitted: true});
    } catch(err){
        res.status(503).json({submitted: false});
    }
});

app.get('/lobbies/:lobbyId/leaderboard', async(req, res)=>{
    const lobbyId = req.params.lobbyId;
    try{
        const leaderboard = await getLeaderboard(lobbyId);
        res.status(200).json({leaderboard});
    } catch(err){
        console.log(err);
        res.status(503).end();
    }
});

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

    socket.on("startMatch", ({lobbyId})=>{
        io.to(lobbyId).emit('start');
    })

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

    socket.on('new-submission', ({lobbyId})=>{
        io.to(lobbyId).emit('leaderboard-updated');
    })

})


server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
})