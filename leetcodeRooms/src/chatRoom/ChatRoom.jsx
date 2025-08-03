import { useRef, useState, useEffect, useContext } from 'react'
import { io } from 'socket.io-client';
import styles from './ChatRoom.module.css';
import { participantsContext,userIdContext, lobbyIdContext } from '../Contexts.js';

function ChatRoom() {
    const messageInputRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const socketRef = useRef(null);
    const lobbyId = useContext(lobbyIdContext);
    const userId = useContext(userIdContext);
    const setParticipants = useContext(participantsContext);

    useEffect(() => {
        const socket = io('http://192.168.29.53:3000');
        socketRef.current = socket;

        socketRef.current.emit('joinLobby', { lobbyId, userId });

        socketRef.current.on('userJoined', ({ userId }) => {
            setMessages((prev) => [...prev, `${userId} joined the lobby`]);
        });

        socketRef.current.on('chatMsg', ({ userId, message }) => {
            setMessages((prev) => [...prev, `${userId}: ${message}`]);
        });

        socketRef.current.on('participantsUpdate', ({users})=>{
            setParticipants(users);
        });

        return () => {
        socketRef.current.disconnect();
        };
    }, []);

    const sendMessage = () => {
        const message = messageInputRef.current.value.trim();
        if (message === '') return;
        socketRef.current.emit('chatMsg', { lobbyId, userId, message });
        messageInputRef.current.value = '';
    };

    return (
        <div className={styles.chatContainer}> 
            <div className={styles.messages}>
                {messages.map((msg, index) => (
                <div key={index}>{msg}</div>
                ))}
            </div>
             
            <div className={styles.sendMessageContainer}>
                <input type="text" ref={messageInputRef} placeholder="Enter Message" />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    )
}

export default ChatRoom