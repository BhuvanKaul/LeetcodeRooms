import styles from './joinRoomPopup.module.css';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

function JoinRoomPopup (props){
    const serverIP = import.meta.env.VITE_SERVER_IP;
    const [showPopup, setShowPopup] = [props.showPopup, props.setShowPopup];
    const joinPopupRef = useRef(null);
    const lobbyIdInputRef = useRef(null);
    const navigate = useNavigate();
    const nameRef = useRef(null);
    const [nameError, setNameError] = useState(false);
    const [showEmptyNameError, setShowEmptyNameError] = useState(false);
    const [showLongNameError, setShowLongNameError] = useState(false);
    const [wrongPasswordError, setWrongPasswordError] = useState(false);

    const [showPasswordInput, setShowPasswordInput] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [lobbyError, setLobbyError] = useState(false);
    const [networkError, setNetworkError] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (lobbyError || networkError || wrongPasswordError) {
            const timer = setTimeout(() => {
                setLobbyError(false);
                setNetworkError(false);
                setWrongPasswordError(false);
            }, 4000);

            return () => clearTimeout(timer);
        }
    }, [lobbyError, networkError, wrongPasswordError]);

    const handleCancelButton = ()=>{
        setShowPopup(false);
    }

    const JoinLobby = (lobbyId)=>{
        navigate(`/lobbies/${lobbyId}`);
    }

    const handleJoinLobby = async()=>{
        setLobbyError(false);
        setNetworkError(false);
        setWrongPasswordError(false)

        setIsJoining(true);
        const name = nameRef.current.value.trim();

        if (name === ''){
            setNameError(true);
            setShowLongNameError(false);
            setShowEmptyNameError(true);
            setIsJoining(false);
            return;
        } else if(name.length > 20){
            setNameError(true);
            setShowLongNameError(true);
            setShowEmptyNameError(false);
            setIsJoining(false);
            return;
        }
        
        localStorage.setItem('name', name);
        const lobbyId = lobbyIdInputRef.current.value;

        try {
            const typeResponse = await fetch(`${serverIP}/lobbies/${lobbyId}/lobbyType`);
            
            if (!typeResponse.ok) {
                setLobbyError(true);
                setShowPasswordInput(false);
                return;
            }

            const data = await typeResponse.json();

            if (data.lobbyType === 'public') {
                JoinLobby(lobbyId);

            } else if (data.lobbyType === 'private') {
                if (!showPasswordInput) {
                    setShowPasswordInput(true);
                } else {
                    const userId = localStorage.getItem('userId') || uuidv4();
                    localStorage.setItem('userId', userId);

                    const joinResponse = await fetch(`${serverIP}/lobbies/${lobbyId}/generateJWT`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ password, userId, name}),
                        credentials: 'include'
                    });
                    if (joinResponse.ok) {
                        const {jwtToken} = await joinResponse.json();
                        navigate(`/lobbies/${lobbyId}`, { state: { token: jwtToken } });
                    } else {
                        setWrongPasswordError(true);
                    }
                }
            }
        } catch (err) {
            console.log(err);
            setNetworkError(true);
        } finally {
            setIsJoining(false);
        }
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

            {lobbyError && <div className="errorMessage">Lobby not found.</div>}
            {networkError && <div className="errorMessage">Network error. Please try again.</div>}
            {wrongPasswordError && <div className="errorMessage">Incorrect password.</div>}

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
                    <input  ref={lobbyIdInputRef} 
                            type="text" 
                            placeholder='Enter lobby ID' 
                            className={styles.idInput} />
                    <p>Ask the lobby creator for the unique lobby ID</p>
                </div>

                {showPasswordInput &&
                    <div>
                        <h4 className={styles.passwordLabel}>
                            Password: 
                        </h4>
                        <div className={styles.passwordInputContainer}>
                            <input  type= {showPassword? 'text' : "password"}
                                placeholder='Enter lobby password'
                                className={styles.idInput}
                                value={password}
                                onChange= {(e)=>{setPassword(e.target.value)}}
                                 />
                            
                            <button type="button"
                                    className={styles.togglePasswordButton}
                                    onClick={() => {setShowPassword(prvs => !prvs)}}>
                                
                                {showPassword ? <EyeOff /> : <Eye />}
                            </button>
                        </div>
                        
                    </div>
                }

                <div className={styles.buttonContainer}>
                    <button onClick={handleCancelButton}>
                        Cancel
                    </button>
                    <button onClick={handleJoinLobby} disabled={isJoining}>
                        {isJoining ? (
                            <div className={styles.loader}>
                                <div /><div /><div />
                            </div>
                        ) : (
                            'Join Lobby'
                        )}
                    </button>
                </div>


            </div>
        </div>
    )
}

export default JoinRoomPopup;