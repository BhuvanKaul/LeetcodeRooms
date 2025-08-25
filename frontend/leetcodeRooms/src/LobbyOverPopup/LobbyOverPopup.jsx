import styles from './LobbyOverPopup.module.css'
import { ShieldAlert } from 'lucide-react';
import { useContext } from 'react';
import { showLobbyOverPopupContext } from '../Contexts';

function LobbyOverPopup() {
    const [showLobbyOverPopup, setShowLobbyOverPopup] = useContext(showLobbyOverPopupContext);

    return (
        <div className={styles.overlay}>
            <div className={styles.popup}>
                <ShieldAlert size={48} className={styles.icon} />
                <h2>Lobby Over</h2>
                <p>
                    The competition has ended. You can no longer submit questions.
                </p>
                <p className={styles.subtext}>
                    You may continue to view the questions and final rankings for the next 30 minutes.
                </p>
                <button className={styles.okButton} onClick={()=>setShowLobbyOverPopup(false)}>
                    OK
                </button>
            </div>
        </div>
    )
}

export default LobbyOverPopup