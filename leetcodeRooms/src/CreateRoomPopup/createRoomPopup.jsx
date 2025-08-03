import styles from './createRoomPopup.module.css'
import {Users, Lock} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

function CreateRoomPopup(props){
    const navigate = useNavigate();
    const [showPopup, setShowPopup] = [props.showPopup, props.setShowPopup];
    const [lobbyType, setLobbyType] = useState('public');
    const popupContainerRef = useRef(null);

    const handleCancelButton = () => {
        setShowPopup(false);
    };

    const handleLobbyTypeChange = (e) =>{
        setLobbyType(e.target.value);
    };

    useEffect(()=>{
        const handleClickOutside = (e)=>{
            if (popupContainerRef.current && !popupContainerRef.current.contains(e.target)){
                setShowPopup(false);
            };
        }

        if (showPopup){
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showPopup])

    const handleCreateLobby = async() => {
        let userId = localStorage.getItem('userId');
        if (!userId){
            userId = uuidv4();
            localStorage.setItem('userId', userId);
        }

        try{
            const response = await fetch('http://192.168.29.53:3000/lobbies', {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: userId
                })
            })

            if (!response.ok){
                throw new Error(`BAD HTTP STATUS: ${response.status}`);
            }
            const data = await response.json();
            const createdLobbyId = data.lobbyId;

            navigate(`/lobbies/${createdLobbyId}`);
        
        }catch(err){
            console.log(err);
        }
    };

    return (
        <div className={styles.backdrop}>
            <div ref = {popupContainerRef} className={styles.popupContainer}>
                <div className={styles.headingContainer}>
                    <h3>
                        Create New Lobby
                    </h3>
                </div>

                <div className={styles.lobbyTypeContainer}>
                    <h4 className={styles.lobbyTypeText}>Lobby Type</h4>

                    <div className={styles.lobbyTypeButtonContainer}>

                        <div className={styles.publicContainer}>
                            <input  type='radio'
                                    value='public' 
                                    checked={lobbyType==='public'}
                                    onChange={handleLobbyTypeChange}>
                            </input>
                            <Users/>
                            <div className={styles.publicText}>
                                <h4>Public</h4>
                                <p>Anyone can join</p>
                            </div>
                        </div>

                        <div className={styles.privateContainer}>
                            <input  type='radio'
                                    value='private' 
                                    checked={lobbyType==='private'}
                                    onChange={handleLobbyTypeChange}>
                            </input>
                            <Lock/>
                            <div className={styles.privateText}>
                                <h4>Private</h4>
                                <p>Password protected</p>
                            </div>
                        </div>

                    </div>

                </div>
                    
                {lobbyType === 'private' && <div className={styles.passwordContainer}>
                    <h4>Password</h4>
                    <input className={styles.passwordInput} type='password' placeholder='Enter Password...'></input>
                </div>}

                <div className={styles.buttonContainer}>
                    <div className={styles.cancelButtonContainer}>
                        <button onClick={handleCancelButton}>Cancel</button>
                    </div>
                    <div className={styles.createButtonContainer}>
                        <button onClick={handleCreateLobby}>Create Lobby</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateRoomPopup;