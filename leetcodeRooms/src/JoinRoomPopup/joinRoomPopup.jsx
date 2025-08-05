import styles from './joinRoomPopup.module.css';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function JoinRoomPopup (props){
    const [showPopup, setShowPopup] = [props.showPopup, props.setShowPopup];
    const joinPopupRef = useRef(null);
    const lobbyIdInputRef = useRef(null);
    const navigate = useNavigate();
    const nameRef = useRef(null);
    const [nameError, setNameError] = useState(false);
    const [showEmptyNameError, setShowEmptyNameError] = useState(false);
    const [showLongNameError, setShowLongNameError] = useState(false);

    const handleCancelButton = ()=>{
        setShowPopup(false);
    }

    const handleJoinLobby = ()=>{
        const name = nameRef.current.value.trim();

        if (name === ''){
            setNameError(true);
            setShowLongNameError(false);
            setShowEmptyNameError(true);
            return;
        } else if(name.length > 20){
            setNameError(true);
            setShowLongNameError(true);
            setShowEmptyNameError(false);
            return;
        }
        

        localStorage.setItem('name', name);
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

    useEffect(()=>{
        const timeOutId = setTimeout(()=>{
            setNameError(false);
        },300);
        
        return()=> clearTimeout(timeOutId);
    }, [nameError]);
    
    return(
        <div className={styles.backdrop}>
            <div ref = {joinPopupRef} className={styles.popupContainer}>

                <div className={styles.headingContainer}>
                    <h3>Join Lobby</h3>
                </div>

                <div className={styles.nameContainer}>
                    <h4>Your Name</h4>
                    <input type="text" placeholder='Enter Name' ref={nameRef} className={nameError? styles.shake: ''}/>

                    {showLongNameError && 
                    <div className={styles.errorMessage}>
                        Name should be 20 characters or less
                    </div>
                    }

                    {showEmptyNameError && 
                    <div className={styles.errorMessage}>
                        Name cannot be blank
                    </div>
                    }
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