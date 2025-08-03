import { useEffect, createContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useParams, useNavigate } from 'react-router-dom';
import Lobby from '../lobby/lobby.jsx';
import { lobbyIdContext, userIdContext } from '../Contexts.js';


function Room() {
    const navigate = useNavigate();
    const {lobbyId} = useParams();
    const userId = localStorage.getItem('userId') || uuidv4();
    localStorage.setItem('userId',userId);

    useEffect(()=>{
        const sendUserId = async() =>{
            const res = await fetch(`http://192.168.29.53:3000/lobbies/${lobbyId}/join`, 
                {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userId: userId
                    })
                }
            )
            if(!res.ok){
                navigate('/');
                console.log('Could Not Add User');
            }
        }
        sendUserId();

    }, []);

    return (
        <div>
            <lobbyIdContext.Provider value={lobbyId}>
            <userIdContext.Provider value={userId}>
                <Lobby/>
            </userIdContext.Provider>
            </lobbyIdContext.Provider>

        </div>
    );
}

export default Room;
