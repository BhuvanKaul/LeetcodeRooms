import LobbyHeader from "../lobbyHeader/lobbyHeader";
import styles from './lobby.module.css';
import ChatRoom from "../chatRoom/ChatRoom";
import { useState, useContext, useMemo } from "react";
import { participantsContext, chosenTopicsContext, randomTopicContext, ownerIdContext, userIdContext } from "../Contexts.js";
import Participants from '../Participants/Participants.jsx';
import LobbySettings from "../lobbySettings/LobbySettings.jsx";

function Lobby() {
    const [participants, setParticipants] = useState([]);
    const [chosenTopics, setChosenTopics] = useState([]);
    const [randomTopic, setRandomTopic] = useState(false);
    const ownerId = useContext(ownerIdContext);
    const userId = useContext(userIdContext);
    const isOwner = ownerId?.trim() === userId?.trim();

    const participantsVal = useMemo(()=> ({ participants, setParticipants }), [participants]);
    const chosenTopicsVal = useMemo(() => ({ chosenTopics, setChosenTopics }), [chosenTopics]);
    const randomTopicVal = useMemo(() => ({ randomTopic, setRandomTopic }), [randomTopic]);
    
    return (
        <div>
            <LobbyHeader/>
            <div className={styles.mainContainer}>

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
                    

                </div>

                <div className={styles.chatContainer}>
                    <participantsContext.Provider value={participantsVal}>
                        <ChatRoom />
                    </participantsContext.Provider>
                </div>
            </div>
        </div>
    ) 
}

export default Lobby