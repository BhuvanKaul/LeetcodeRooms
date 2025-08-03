import {Users} from 'lucide-react';
import styles from './createCard.module.css'

function CreateCard(props){
    const [showPopup, setShowPopup] = [props.showPopup, props.setShowPopup];

    const handleShowPopupChange = ()=>{
        setShowPopup(true);
    }
    return (
        <div className={styles.createCard}>
            <div className={styles.logoContainer}>
                <Users className={styles.logo}/>
            </div>
            <h1>Create Lobby</h1>
            <p>Host a new Room and invite others</p>
            <button onClick={handleShowPopupChange}>
                <Users className={styles.buttonLogo}/>
                Create New Lobby
            </button>
        </div>
    )
}

export default CreateCard