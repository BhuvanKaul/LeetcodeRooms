import LobbyHeader from "../lobbyHeader/lobbyHeader";
import styles from './lobby.module.css';
import ChatRoom from "../chatRoom/ChatRoom";
import { useState } from "react";
import { participantsContext, chosenTopicsContext, randomTopicContext } from "../Contexts.js";
import Participants from '../Participants/Participants.jsx';
import LobbySettings from "../lobbySettings/LobbySettings.jsx";

function Lobby() {
    const [participants, setParticipants] = useState([]);
    const [chosenTopics, setChosenTopics] = useState([]);
    const [randomTopic, setRandomTopic] = useState(false);
    
    return (
        <div>
            <LobbyHeader/>
            <div className={styles.mainContainer}>

                <div className={styles.lobbyInfo}>

                    <participantsContext.Provider value={{participants, setParticipants}}>
                        <Participants/>
                    </participantsContext.Provider>

                    <chosenTopicsContext.Provider value={{chosenTopics, setChosenTopics}}>
                    <randomTopicContext.Provider value={{randomTopic, setRandomTopic}}>
                        <LobbySettings/>
                    </randomTopicContext.Provider>
                    </chosenTopicsContext.Provider>

                </div>

                <div className={styles.chatContainer}>
                    <participantsContext.Provider value={{participants, setParticipants}}>
                        <ChatRoom />
                    </participantsContext.Provider>
                </div>
            </div>
        </div>
    ) 
}

export default Lobby