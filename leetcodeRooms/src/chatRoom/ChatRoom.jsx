import React, { useRef, useState, useEffect, useContext } from 'react';
import styles from './ChatRoom.module.css';
import { nameContext } from '../Contexts.js'; 
import { Send } from 'lucide-react';

const formatTimeStamp = (date) => {
    if (!(date instanceof Date) || isNaN(date)) {
        return '';
    }
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

function ChatRoom({ messages, sendMessage }) { 
    const messageInputRef = useRef(null);
    const name = useContext(nameContext);
    const messagesRef = useRef(null);

    useEffect(() => {
        if (messagesRef.current) {
            const container = messagesRef.current;
            container.scrollTop = container.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        const message = messageInputRef.current.value;
        sendMessage(message); 
        messageInputRef.current.value = '';
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleSend();
        }
    }

    return (
        <div className={styles.chatContainer}> 
            <div className={styles.messages} ref={messagesRef}>
                {messages.map((msg, index) => {
                    if (msg.type === 'systemJoin'){
                        return (
                            <div key={index} className={styles.systemMessage}>
                                <strong>{msg.name}</strong> joined the lobby
                            </div>
                        );
                    } else if (msg.type === 'systemLeave'){
                        return (
                            <div key={index} className={styles.systemMessage}>
                                <strong>{msg.name}</strong> left the lobby
                            </div>
                        )
                    }

                    return(
                        <div key={index} className={styles.messageEntry} data-isme={msg.name === name ? 'true' : 'false'}>
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
                <button onClick={handleSend}>
                    <div className={styles.sendIconContainer}>
                        <Send className={styles.sendIcon}/>
                    </div>
                </button>
            </div>
        </div>
    )
}

export default React.memo(ChatRoom);