import styles from './lobbyHeader.module.css';
import { Play } from 'lucide-react';
import { useContext } from 'react';
import { lobbyIdContext } from '../Contexts';

function LobbyHeader() {
    const lobbyId = useContext(lobbyIdContext);
    return (
        <div className={styles.lobbyHeaderContainer}>
            <h1>LeetRooms</h1>
            <div className={styles.headerRightSide}>
                <div className={styles.lobbyId}>Lobby ID: {lobbyId}</div>
                <button className={styles.startCompetitionButton}>
                    <Play className={styles.playIcon}/>
                    Start Competition
                </button>
            </div>
            
        </div>
    )
}

export default LobbyHeader