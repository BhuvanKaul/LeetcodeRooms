import styles from './lobbyHeader.module.css';
import { Play } from 'lucide-react';
import { useContext } from 'react';
import { lobbyIdContext, competitionStarted } from '../Contexts';

function LobbyHeader() {
    const [started, setStarted] = useContext(competitionStarted);
    const lobbyId = useContext(lobbyIdContext);

    const startMatch = () =>{
        setStarted(true);
    }

    return (
        <div className={styles.lobbyHeaderContainer}>
            <h1>LeetRooms</h1>
            <div className={styles.headerRightSide}>
                <div className={styles.lobbyId}>Lobby ID: {lobbyId}</div>
                <button className={styles.startCompetitionButton} onClick={startMatch}>
                    <Play className={styles.playIcon}/>
                    Start Competition
                </button>
            </div>
            
        </div>
    )
}

export default LobbyHeader