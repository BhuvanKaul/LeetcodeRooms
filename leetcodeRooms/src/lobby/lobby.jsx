import LobbyHeader from "../lobbyHeader/lobbyHeader";
import styles from './lobby.module.css';
import ChatRoom from "../chatRoom/ChatRoom";
import { useState, useContext, useMemo, useEffect, useRef, useCallback } from "react";
import { io } from 'socket.io-client';
import { 
    participantsContext, chosenTopicsContext, randomTopicContext, ownerIdContext, 
    userIdContext, competitionStarted, questionsContext, leaderboardContext, 
    lobbyIdContext, nameContext, socketContext
} from "../Contexts.js";
import Participants from '../Participants/Participants.jsx';
import LobbySettings from "../lobbySettings/LobbySettings.jsx";
import NotOwner from "../NotOwner/NotOwner.jsx";
import Questions from "../Questions/Questions.jsx";

function Lobby() {
    const [participants, setParticipants] = useState([]);
    const [chosenTopics, setChosenTopics] = useState([]);
    const [started, setStarted] = useContext(competitionStarted);
    const [randomTopic, setRandomTopic] = useState(true);
    const ownerId = useContext(ownerIdContext);
    const userId = useContext(userIdContext);
    const lobbyId = useContext(lobbyIdContext);
    const name = useContext(nameContext);
    const isOwner = ownerId?.trim() === userId?.trim();
    const [questions, setQuestions] = useContext(questionsContext);
    const [leaderboard, setLeaderboard] = useState([]);
    const socketRef = useRef(null);
    const [messages, setMessages] = useState([]);

    const participantsVal = useMemo(()=> ({ participants, setParticipants }), [participants]);
    const chosenTopicsVal = useMemo(() => ({ chosenTopics, setChosenTopics }), [chosenTopics]);
    const randomTopicVal = useMemo(() => ({ randomTopic, setRandomTopic }), [randomTopic]);

    const fetchLeaderboard = useCallback(async () => {
        if (!lobbyId) return; 
        try {
            const serverIP = import.meta.env.VITE_SERVER_IP;
            const res = await fetch(`${serverIP}/lobbies/${lobbyId}/leaderboard`);
            if (!res.ok) throw new Error('Failed to fetch leaderboard');
            const data = await res.json();
            setLeaderboard(data.leaderboard || []);
        } catch (error) {
            console.error("Leaderboard fetch error:", error);
        }
    }, [lobbyId]);

    useEffect(() => {
        fetchLeaderboard();

        const serverIP = import.meta.env.VITE_SERVER_IP;
        const socket = io(serverIP);
        socketRef.current = socket;

        if (lobbyId && userId && name) {
            socket.emit('joinLobby', { lobbyId, userId, name });
        }

        socket.on('participantsUpdate', ({ users }) => {
            setParticipants(users);
        });

        socket.on('start', () => {
            setStarted(true);
        });

        socket.on('userJoined', ({ name }) => {
            setMessages((prev) => [...prev, {
                type: 'system', name: name, timeStamp: new Date()
            }]);
        });

        socket.on('chatMsg', ({ name, message }) => {    
            setMessages((prev) => [...prev, {
                type: 'chat', name: name, timeStamp: new Date(), message: message
            }]);
        });
        
        socket.on('leaderboard-updated', fetchLeaderboard);

        return () => {
            socket.disconnect();
        };
    }, [lobbyId, userId, name, setStarted, fetchLeaderboard]);

    useEffect(() => {
        if (started && isOwner && socketRef.current) {
            socketRef.current.emit('startMatch', { lobbyId });
        }
    }, [started, isOwner, lobbyId]);

    const sendMessage = useCallback((message) => {
        if (message.trim() === '' || !socketRef.current) return;
        socketRef.current.emit('chatMsg', { lobbyId, name, message });
    }, [lobbyId, name]);

    return (
        <div className={styles.lobbyContainer}>
            <LobbyHeader/>
            <div className={styles.mainContainer}>
                { !started && 
                    <div className={styles.lobbyInfo}>
                        <participantsContext.Provider value={participantsVal}>
                            <Participants/>
                        </participantsContext.Provider>
                        {isOwner && 
                            <chosenTopicsContext.Provider value={chosenTopicsVal}>
                            <randomTopicContext.Provider value={randomTopicVal}>
                                <LobbySettings/>
                            </randomTopicContext.Provider>
                            </chosenTopicsContext.Provider>
                        }
                        {!isOwner && <NotOwner/> } 
                    </div>
                }

                {started &&
                    <leaderboardContext.Provider value={[leaderboard, setLeaderboard]}>
                    <socketContext.Provider value={socketRef}>
                        <Questions />
                    </socketContext.Provider>
                    </leaderboardContext.Provider>
                }

                <div className={styles.chatContainer}>
                    <ChatRoom messages={messages} sendMessage={sendMessage} />
                </div>
            </div>
        </div>
    ) 
}

export default Lobby;