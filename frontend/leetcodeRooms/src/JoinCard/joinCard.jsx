import {Zap} from 'lucide-react';
import styles from './joinCard.module.css';

function JoinCard(props){
    const [showPopup, setShowPopup] = [props.showPopup, props.setShowPopup];

    const handleShowPopup = () =>{
        setShowPopup(true);
    }

    return (
        <div className={styles.joinCard}>
            <div className={styles.logoContainer}>
                <Zap className={styles.logo}/>
            </div>
            <h1>Join Lobby</h1>
            <p>Enter lobby ID to join an existing lobby</p>
            <button onClick={handleShowPopup}>
                <Zap className={styles.buttonLogo}/>
                Join Existing Lobby
            </button>
        </div>
    )
}

export default JoinCard