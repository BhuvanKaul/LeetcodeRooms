import styles from './lobbyHeader.module.css';
import { Play } from 'lucide-react';
import { useContext } from 'react';
import { lobbyIdContext, sendDataContext, competitionStarted, ownerIdContext, userIdContext, startTimeContext, timeLimitContext } from '../Contexts';
import Timer from '../Timer/Timer';

function LobbyHeader() {
    const [sendData, setSendData] = useContext(sendDataContext);
    const [started, setStarted] = useContext(competitionStarted);
    const lobbyId = useContext(lobbyIdContext);
    const userId = useContext(userIdContext);
    const ownerId = useContext(ownerIdContext);
    const isOwner = ownerId?.trim() === userId?.trim();
    const startTimeRef = useContext(startTimeContext);
    const timeLimitRef = useContext(timeLimitContext)

    const startMatch = () =>{
        setSendData(true);
    }

    return (
        <div className={styles.lobbyHeaderContainer}>
            <h1>LeetRooms</h1>
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
                {started &&
                    <Timer startTime={startTimeRef.current} timeLimit={timeLimitRef.current}/>
                }
            </div>
        </div>
    )
}

export default LobbyHeader