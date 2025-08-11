import React, { useRef, useState, useEffect, useContext, use } from 'react'
import { io } from 'socket.io-client';
import styles from './ChatRoom.module.css';
import { participantsContext,userIdContext, lobbyIdContext, nameContext,competitionStarted, ownerIdContext } from '../Contexts.js';
import { Send } from 'lucide-react';

const formatTimeStamp = (date) => {
    if (!(date instanceof Date) || isNaN(date)) {
        return '';
    }
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

function ChatRoom() {
    const messageInputRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const socketRef = useRef(null);
    const lobbyId = useContext(lobbyIdContext);
    const userId = useContext(userIdContext);
    const name = useContext(nameContext);
    const {participants, setParticipants} = useContext(participantsContext);
    const messagesRef = useRef(null);
    const [started, setStarted] = useContext(competitionStarted);
    const ownerId = useContext(ownerIdContext);
    const isOwner = ownerId?.trim() === userId?.trim();

    useEffect(() => {
        const socket = io('http://192.168.29.53:3000');
        socketRef.current = socket;

        socketRef.current.emit('joinLobby', { lobbyId, userId, name });

        socketRef.current.on('userJoined', ({ name }) => {
            setMessages((prev) => [...prev, {   type: 'system',
                                                name: name,
                                                timeStamp: new Date()

            }]);
        });

        socketRef.current.on('chatMsg', ({ name, message }) => {    
            setMessages((prev) => [...prev, {   type: 'chat',
                                                name: name,
                                                timeStamp: new Date(),
                                                message: message
            }]);
        });

        socketRef.current.on('participantsUpdate', ({users})=>{
            setParticipants(users);
        });

        socketRef.current.on('start', ()=>{
            setStarted(true);
        })

        return () => {
        socketRef.current.disconnect();
        };
    }, []);

    useEffect(()=>{
        if (started && isOwner){
            socketRef.current.emit('startMatch', {lobbyId});
        }
    }, [started])

    useEffect(() => {
        if (messagesRef.current) {
            const container = messagesRef.current;
            container.scrollTop = container.scrollHeight;
        }
    }, [messages]);

    const sendMessage = () => {
        const message = messageInputRef.current.value.trim();
        if (message === '') return;
        socketRef.current.emit('chatMsg', { lobbyId, name, message });
        messageInputRef.current.value = '';
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    }

    return (
        <div className={styles.chatContainer}> 
            <div className={styles.messages} ref={messagesRef}>
                {messages.map((msg, index) => {
                    if (msg.type === 'system'){
                        return (
                            <div key={index} className={styles.systemMessage}>
                                <strong>{msg.name}</strong> joined the lobby.
                            </div>
                        );
                    }

                    return(
                        <div key={index} className={styles.messageEntry}>
                            <div className={styles.messageHeader}>
                                <span className={styles.senderName}>
                                    {msg.name === name ? 'You' : msg.name}
                                </span>
                                <span className={styles.timeStamp}>
                                    {formatTimeStamp(msg.timeStamp)}
                                </span>
                            </div>
                            <div className={styles.messageBubble}>
                                {msg.message}
                            </div>
                        </div>
                    );
                })}
            </div>
             
            <div className={styles.sendMessageContainer}>
                <input type="text" ref={messageInputRef} placeholder="Enter Message" onKeyDown={handleKeyDown}/>
                <button onClick={sendMessage}>
                    <div className={styles.sendIconContainer}>
                        <Send className={styles.sendIcon}/>
                    </div>
                </button>
            </div>
        </div>
    )
}

export default React.memo(ChatRoom);    