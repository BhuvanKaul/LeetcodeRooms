import LobbyHeader from "../lobbyHeader/lobbyHeader";
import styles from './lobby.module.css';
import ChatRoom from "../chatRoom/ChatRoom";
import { useState, useContext, useMemo, useEffect, useRef, useCallback } from "react";
import { io } from 'socket.io-client';
import { 
    participantsContext, chosenTopicsContext, randomTopicContext, ownerIdContext, 
    userIdContext, competitionStarted, leaderboardContext, 
    lobbyIdContext, nameContext, socketContext, lobbyInitializationContext, lobbyOverContext,
    showLobbyOverPopupContext } from "../Contexts.js";
import Participants from '../Participants/Participants.jsx';
import LobbySettings from "../lobbySettings/LobbySettings.jsx";
import NotOwner from "../NotOwner/NotOwner.jsx";
import Questions from "../Questions/Questions.jsx";
import LobbyOverPopup from "../LobbyOverPopup/LobbyOverPopup.jsx";
import { replace, useNavigate } from "react-router-dom";

function Lobby() {
    const navigate = useNavigate();
    const {participants, setParticipants} = useContext(participantsContext);
    const [chosenTopics, setChosenTopics] = useState([]);
    const [started, setStarted] = useContext(competitionStarted);
    const [randomTopic, setRandomTopic] = useState(true);
    const ownerId = useContext(ownerIdContext);
    const userId = useContext(userIdContext);
    const lobbyId = useContext(lobbyIdContext);
    const name = useContext(nameContext);
    const isOwner = ownerId?.trim() === userId?.trim();
    const [leaderboard, setLeaderboard] = useState([]);
    const socketRef = useRef(null);
    const [messages, setMessages] = useState([ { type: 'systemJoin', name: "You", timeStamp: new Date() } ]);
    const isInitialized = useContext(lobbyInitializationContext);
    const [lobbyOver, setLobbyOver] = useContext(lobbyOverContext);
    const [showLobbyOverPopup, setShowLobbyOverPopup] = useState(true);

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
        if(!isInitialized){
            return
        }

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

        socket.on('userJoined', ({ name, userId }) => {
            setMessages((prev) => [...prev, {
                type: 'systemJoin', name: name, userId, timeStamp: new Date()
            }]);
        });

        socket.on('chatMsg', ({ name, message, userId }) => {    
            setMessages((prev) => [...prev, {
                type: 'chat', name: name, timeStamp: new Date(), message: message, userId: userId
            }]);
        });
        
        socket.on('leaderboard-updated', fetchLeaderboard);

        socket.on('submission-message', ({name, questionNumber}) =>{
            setMessages((prev) => [...prev, {
                type: 'userSubmission', name, questionNumber
            }]);
        });

        socket.on('leaveLobby', ({ name }) =>{
             setMessages((prev) => [...prev, {
                type: 'systemLeave', name: name, timeStamp: new Date()
            }]);
        });

        socket.on('lobby-deletion', ()=>{
            navigate('/', {replace: true});
            socket.disconnect();
        })

        return () => {
            socket.disconnect();
        };
    }, [lobbyId, userId, name, setStarted, fetchLeaderboard, isInitialized]);

    useEffect(() => {
        if (started && isOwner && socketRef.current) {
            socketRef.current.emit('startMatch', { lobbyId });
        }
    }, [started, isOwner, lobbyId]);

    const sendMessage = useCallback((message) => {
        if (message.trim() === '' || !socketRef.current) return;
        socketRef.current.emit('chatMsg', { lobbyId, name, message, userId });
    }, [lobbyId, name, userId]);

    return (
        <div className={styles.lobbyContainer}>

            {lobbyOver && showLobbyOverPopup &&
                <showLobbyOverPopupContext.Provider value={[showLobbyOverPopup, setShowLobbyOverPopup]}>
                    <LobbyOverPopup />
                </showLobbyOverPopupContext.Provider>
            }

            <LobbyHeader/>
            <div className={styles.mainContainer}>
                { !started && 
                    <div className={styles.lobbyInfo}>
                            <Participants/>
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