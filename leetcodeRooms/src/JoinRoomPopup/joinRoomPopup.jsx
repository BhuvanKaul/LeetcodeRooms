import styles from './joinRoomPopup.module.css';
import { useEffect, useRef} from 'react';
import { useNavigate } from 'react-router-dom';

function JoinRoomPopup (props){
    const [showPopup, setShowPopup] = [props.showPopup, props.setShowPopup];
    const joinPopupRef = useRef(null);
    const lobbyIdInputRef = useRef(null);
    const navigate = useNavigate();

    const handleCancelButton = ()=>{
        setShowPopup(false);
    }

    const handleJoinLobby = ()=>{
        const lobbyId = lobbyIdInputRef.current.value;
        navigate(`/lobbies/${lobbyId}`);
    }

    useEffect(()=>{
        const handleOutsideClick = (e) =>{
            if (joinPopupRef.current && !joinPopupRef.current.contains(e.target)){
                setShowPopup(false);
            }
        };

        if (showPopup){
            document.addEventListener('mousedown', handleOutsideClick);
        }
        return () =>{
            document.removeEventListener('mousedown', handleOutsideClick);
        }
    }, [showPopup])
    
    return(
        <div className={styles.backdrop}>
            <div ref = {joinPopupRef} className={styles.popupContainer}>

                <div className={styles.headingContainer}>
                    <h3>Join Lobby</h3>
                </div>

                <div className={styles.inputContainer}>
                    <h4>Lobby ID:</h4>
                    <input ref={lobbyIdInputRef} type="text" placeholder='Enter lobby ID' className={styles.idInput}/>
                    <p>Ask the lobby creator for the unique lobby ID</p>
                </div>

                <div className={styles.buttonContainer}>
                    <button onClick={handleCancelButton}>
                        Cancel
                    </button>
                    <button onClick={handleJoinLobby}>
                        Join Lobby
                    </button>
                </div>


            </div>
        </div>
    )
}

export default JoinRoomPopup;