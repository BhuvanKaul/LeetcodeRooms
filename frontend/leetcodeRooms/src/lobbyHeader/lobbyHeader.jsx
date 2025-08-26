import styles from './lobbyHeader.module.css';
import { Play } from 'lucide-react';
import { useContext } from 'react';
import {    lobbyIdContext, sendDataContext, competitionStarted, ownerIdContext, userIdContext,
            startTimeContext, timeLimitContext, lobbyOverContext   
         } from '../Contexts';
import Timer from '../Timer/Timer';
import DeletionTimer from '../DeletionTimer/DeletionTimer';

function LobbyHeader() {
    const [sendData, setSendData] = useContext(sendDataContext);
    const [started, setStarted] = useContext(competitionStarted);
    const lobbyId = useContext(lobbyIdContext);
    const userId = useContext(userIdContext);
    const ownerId = useContext(ownerIdContext);
    const isOwner = ownerId?.trim() === userId?.trim();

    const startTimeRef = useContext(startTimeContext);
    const timeLimitRef = useContext(timeLimitContext);
    const [lobbyOver, setLobbyOver] = useContext(lobbyOverContext);

    const competitionEndTime = startTimeRef.current && timeLimitRef.current ? 
                                new Date(new Date(startTimeRef.current).getTime() + timeLimitRef.current * 60 *1000) : null;

    const startMatch = () =>{
        setSendData(true);
    }

    return (
        <div className={styles.lobbyHeaderContainer}>
            <h1>LeetJam</h1>
            <div className={styles.headerRightSide}>
                <div className={styles.lobbyId}>Lobby ID: {lobbyId}</div>
                {!started && isOwner &&
                    <button className={styles.startCompetitionButton} onClick={startMatch} disabled={sendData}>
                        {sendData ? 
                            <div className={styles.loader}></div> : 
                            <Play className={styles.playIcon}/>
                        }
                        {sendData ? 'Starting...' : 'Start Competition'}
                    </button>
                }

                {started && (
                    !lobbyOver ? (
                        <Timer />
                    ) : (
                        <DeletionTimer competitionEndTime={competitionEndTime}/>
                    )
                )}
                
            </div>
        </div>
    )
}

export default LobbyHeader