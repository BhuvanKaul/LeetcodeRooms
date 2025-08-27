import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {getActiveLobbies, addNewPublicLobby, addUser, removeUser, getUsers, 
        getOwner, addLobbyDetails, addQuestions, getQuestions, isStarted, 
        getStartTime, getTimeLimit, getSolvedQuestions, addSubmittedQuestion, getLeaderboard, 
        generateQuestions, addNewPrivateLobby, getLobbyType, getPassword, getLobbyCreateStartTime } from './database.js';
import { makeLobbyID, getLatestSubmission } from './backend_logic.js';
import dotenv from 'dotenv';
import http from 'http';
import {Server} from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { startCleanupService } from './services/lobbyCleanupService.js';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import morgan from 'morgan';
import logger from './logger.js';
import { redisDisconnectCleanup } from './services/redisDisconnectCleanup.js';


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowedOrigins = ["https://leetjam.online"]

if (process.env.NODE_ENV === 'development'){
    allowedOrigins.push("http://192.168.1.55:5173")
}

const app = express();
const port = 3000;
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"]
    }
});

const redisClient = createClient();
redisClient.on('error', err => logger.error('Redis Client Error', err));


const reconnectGracePeriod = 3500;
const JWTSecretKey = process.env.JWT_SECRET_KEY;

app.use(cookieParser());
app.use(express.json());

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

const morganMiddleware = morgan(
    ':method :url :status :res[content-length] - :response-time ms', 
    {
        stream: {
            write: (message) => logger.http(message.trim()),
        },
    }
);
app.use(morganMiddleware);


app.post('/lobbies', async (req, res)=> {
    const ownerId = req.body.userId;
    const lobbyType = req.body.lobbyType;
    const password = req.body.password;
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
            logger.error(`Failed to generate a unique lobby ID after ${maxRetry} attempts.`);
            return res.status(503).json({lobbyId: -1, ownerId:true, connectionSuccess: true});
        }
        if(lobbyType === 'private'){
            await addNewPrivateLobby(requestedLobby, ownerId, password);

            const payload = {lobbyId: requestedLobby};
            const jwtToken = jwt.sign(payload, JWTSecretKey, {'expiresIn': '30m'});

            res.cookie('jwtToken', jwtToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 30 * 60 * 1000,
                sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
            })

        } else{
            await addNewPublicLobby(requestedLobby, ownerId);
        }
        
        return res.status(201).json({lobbyId: requestedLobby});

    }catch(err){
        logger.error(`An unexpected error occurred while creating a lobby for owner ${ownerId}: ${err.message}`, err);
        res.status(503).json({lobbyId:-1, ownerId:true, connectionSuccess: false});
    }
});

app.post('/lobbies/:lobbyId/join', async(req, res)=>{
    const lobbyId = req.params.lobbyId;
    const userId = req.body.userId;
    const name = req.body.name;

    try{
        const lobbyType = await getLobbyType(lobbyId);
        if (!lobbyType){
            return res.status(404).json({ message: "lobby does not exist" })
        }

        if (lobbyType === 'private'){
            let token = null;
            const authHeader = req.headers['authorization'];
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1];
            } else if (req.cookies.jwtToken) {
                token = req.cookies.jwtToken;
            }

            if (!token){
                return res.status(401).json({message: "Private Lobby, Use Password"})
            }

            try{
                const decoded = jwt.verify(token, JWTSecretKey);

                if (decoded.lobbyId !== lobbyId){
                    return res.status(403).json({message: "Wrong Lobby Token"});
                }
            } catch(err){
                return res.status(401).json({message: "Invalid or Expired Token"})
            }
        }

        await addUser(lobbyId, userId, name);

        const ownerId = await getOwner(lobbyId);
        const start = await isStarted(lobbyId);
        const participants = await getUsers(lobbyId);

        res.status(200).json({ ownerId, start,participants })
    } catch(err){
        logger.error(`Failed to join lobby ${lobbyId} for user ${userId}`, err);
        res.status(500).json({message: "Failed to join lobby"});
    }
});



app.post('/lobbies/:lobbyId/info', async(req, res)=>{
    const lobbyId = req.params.lobbyId;
    const lobbyTopics = req.body.lobbyTopics;
    const numberOfQues = req.body.numberOfQues;
    const timeLimit = req.body.timeLimit;
    const difficulty = req.body.difficulty;

    try{
        const questions = await generateQuestions(lobbyTopics, numberOfQues, difficulty);
        await addQuestions(lobbyId, questions);
        await addLobbyDetails(lobbyId, timeLimit);
        res.status(201).json({success: true});
    } catch(err){
        logger.error(`Failed to add lobby info/questions for lobby ${lobbyId}`, err);
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
        logger.error(`Failed to retrieve lobby info for lobby ${lobbyId}`, err);
        res.status(503).end();
    }
});

app.get('/lobbies/:lobbyId/solvedQuestions', async(req, res)=>{
    const lobbyId = req.params.lobbyId;
    const userId = req.query.userId;
    try{
        const solvedQuestions = await getSolvedQuestions(lobbyId, userId);
        res.status(200).json({solvedQuestions: solvedQuestions});
    } catch(err){
        logger.error(`Failed to retrieve solved questions for lobby ${lobbyId}`, err);
        res.status(503).json({error: 'Could not get questions'});
    }
});

app.get('/latestSubmission', async(req, res)=>{
    const userName = req.query.userName;

    try{
        const latestQuestion = await getLatestSubmission(userName);
        res.status(200).json({latestQuestion});
    } catch(err){
        logger.error(`Failed to get latest submission for user: ${userName}`, err);
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
        logger.error(`Failed to submit question for user ${userId} in lobby ${lobbyId}`, err);
        res.status(503).json({submitted: false});
    }
});

app.get('/lobbies/:lobbyId/leaderboard', async(req, res)=>{
    const lobbyId = req.params.lobbyId;
    try{
        const leaderboard = await getLeaderboard(lobbyId);
        res.status(200).json({leaderboard});
    } catch(err){
        logger.error(`Failed to get leaderboard for lobby ${lobbyId}`, err);
        res.status(503).end();
    }
});

app.get('/lobbies/:lobbyId/lobbyType', async(req, res)=>{
    try{
        const lobbyId = req.params.lobbyId;
        const lobbyType = await getLobbyType(lobbyId);

        if (!lobbyType){
            return res.status(400).json({message: "Lobby does not Exists"});
        }

        return res.status(200).json({lobbyType});
    } catch(err){
        logger.error(`Failed to get lobby type for lobby ${lobbyId}`, err);
        return res.status(500).json({message: "Network Error"});
    }
});

app.post('/lobbies/:lobbyId/generateJWT', async(req, res)=>{
    const lobbyId = req.params.lobbyId;
    const {password} = req.body;

    if(!password){
        return res.status(400).json({message: "Private Lobby, Requires Password"});
    }

    try{
        const actualPassword = await getPassword(lobbyId);

        if(!actualPassword){
            return res.status(404).json({ message: "Private lobby not found or does not have a password." });
        }

        const isPasswordCorrect = await bcrypt.compare(password, actualPassword)
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Wrong Password" });
        }

        const {starttime, createtime, timelimit} = await getLobbyCreateStartTime(lobbyId);
        let expirationSeconds;
        const now = new Date();

        if (starttime === null) {
            const deletionTime = new Date(new Date(createtime).getTime() + 30 * 60 * 1000);
            const remainingMs = deletionTime.getTime() - now.getTime();
            expirationSeconds = Math.floor(remainingMs / 1000);
        } else{
            const gameEndTime = new Date(new Date(starttime).getTime() + timelimit * 60 * 1000 + 30*60*1000);
            const remainingMs = gameEndTime.getTime() - now.getTime();
            expirationSeconds = Math.floor(remainingMs / 1000);
        }

        if(expirationSeconds <= 0){
            return res.status(410).json({message: "Lobby ended, will soon be deleted"})
        }

        const payload = { lobbyId: lobbyId };
        const jwtToken = jwt.sign(payload, JWTSecretKey, { 'expiresIn': expirationSeconds });

        res.cookie('jwtToken', jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: expirationSeconds * 1000,
            sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
        });
        return res.status(200).json({message: "Welcome to Lobby", jwtToken});

    } catch(err){
        logger.error(`Failed to generate JWT for lobby ${lobbyId}`, err);
        return res.status(500).json({message: "Network Error"})
    }

});

// WebSockets CODE

io.on("connection", (socket) =>{
    
    socket.on("joinLobby", async ({ lobbyId, userId, name }) => {
        try {
            socket.userId = userId;
            socket.lobbyId = lobbyId;
            socket.name = name;

            // we are counting because on spam reloading, the server will be filled with join events without actually getting the
            // prvs socket disconnect events.  so multiple sockets exist for 1 user and we dont want multiple joins for same user
            const lobbyConnectionCount = await redisClient.sCard(`user:${userId}:lobby:${lobbyId}:sockets`);
            await redisClient.sAdd(`user:${userId}:lobby:${lobbyId}:sockets`, socket.id);
            
            socket.join(lobbyId);
            if (lobbyConnectionCount === 0) {
                io.to(lobbyId).emit('userJoined', { name, userId });
                const users = await getUsers(lobbyId);
                io.to(lobbyId).emit('participantsUpdate', { users });
            }
        } catch (err) {
            logger.error(`Error in joinLobby event for user ${userId}`, err);
        }
    });

    socket.on("chatMsg", ({lobbyId, name, message, userId}) =>{
        io.to(lobbyId).emit("chatMsg", {name, message, userId});
    });

    socket.on("startMatch", ({lobbyId})=>{
        io.to(lobbyId).emit('start');
    })

    socket.on("disconnect", async () => {
        const { userId, lobbyId, name, id: socketId } = socket;

        if (userId && lobbyId) {
            setTimeout(async () => {
                try {
                    // First, check if the user has already reconnected with a new socket.
                    // If they have, the count will be greater than 1.
                    // We still need to remove the OLD, disconnected socket.
                    await redisClient.sRem(`user:${userId}:lobby:${lobbyId}:sockets`, socketId);
                    const finalConnectionCount = await redisClient.sCard(`user:${userId}:lobby:${lobbyId}:sockets`);

                    if (finalConnectionCount === 0) {
                        await removeUser(userId, lobbyId);
                        const users = await getUsers(lobbyId);
                        io.to(lobbyId).emit("leaveLobby", { name });
                        io.to(lobbyId).emit('participantsUpdate', { users });
                    }
                } catch (err) {
                    logger.error(`Error in disconnect timeout for user ${userId}`, err);
                }
            }, reconnectGracePeriod); 
        }
    });

    socket.on('new-submission', ({lobbyId, questionNumber, name})=>{
        io.to(lobbyId).emit('leaderboard-updated');
        io.to(lobbyId).emit('submission-message', {name, questionNumber});
    });

});

const startServer = async () => {
    try {
        await redisClient.connect();
        const pubClient = redisClient.duplicate();
        await pubClient.connect();
        const subClient = redisClient.duplicate();
        await subClient.connect();

        io.adapter(createAdapter(pubClient, subClient));

        server.listen(port, () => {
            logger.info(`Server running on http://localhost:${port}`);
            startCleanupService(io);
            redisDisconnectCleanup(io, redisClient, reconnectGracePeriod)
        });

    } catch (err) {
        logger.error('Application shutting down due to an error:', err);
    }
};

if (process.env.NODE_ENV === 'production') {
    const frontendBuildPath = path.resolve(__dirname, '..', 'frontend', 'leetcodeRooms', 'dist');

    app.use(express.static(frontendBuildPath));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(frontendBuildPath, 'index.html'));
    });
}

startServer();