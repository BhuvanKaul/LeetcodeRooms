import LobbyHeader from "../lobbyHeader/lobbyHeader";
import styles from './lobby.module.css';
import ChatRoom from "../chatRoom/ChatRoom";
import { useState, useContext, useMemo, useEffect } from "react";
import { participantsContext, chosenTopicsContext, randomTopicContext, ownerIdContext, userIdContext, competitionStarted, questionsContext } from "../Contexts.js";
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
    const isOwner = ownerId?.trim() === userId?.trim();
    const [questions, setQuestions] = useContext(questionsContext);


    const participantsVal = useMemo(()=> ({ participants, setParticipants }), [participants]);
    const chosenTopicsVal = useMemo(() => ({ chosenTopics, setChosenTopics }), [chosenTopics]);
    const randomTopicVal = useMemo(() => ({ randomTopic, setRandomTopic }), [randomTopic]);

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

                        {!isOwner &&
                            <NotOwner/>
                        } 

                    </div>
                }

                {questions &&
                    <Questions/ >
                }

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