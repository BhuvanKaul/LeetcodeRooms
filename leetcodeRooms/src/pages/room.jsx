import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useParams, useNavigate } from 'react-router-dom';
import Lobby from '../lobby/lobby.jsx';
import { lobbyIdContext, userIdContext, nameContext, ownerIdContext } from '../Contexts.js';


function Room() {
    const navigate = useNavigate();
    const {lobbyId} = useParams();
    const userId = localStorage.getItem('userId') || uuidv4();
    localStorage.setItem('userId',userId);
    const [ownerId, setOwnerId] = useState(null);

    const name = localStorage.getItem('name') || 'Smarty Pants';

    useEffect(() => {
        const initializeLobby = async () => {
            try {
                const joinRes = await fetch(`http://192.168.29.53:3000/lobbies/${lobbyId}/join`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, name })
                });

                if (!joinRes.ok) {
                    throw new Error('Could not join lobby. It may not exist or is full.');
                }

                const ownerRes = await fetch(`http://192.168.29.53:3000/lobbies/${lobbyId}/owner`);
                if (!ownerRes.ok) {
                    throw new Error('Joined lobby, but could not fetch owner details.');
                }
                
                const ownerData = await ownerRes.json();
                setOwnerId(ownerData.ownerId);

            } catch (error) {
                console.error('Failed to initialize lobby:', error.message);
                navigate('/', {
                    replace: true,
                    state:{
                        error: error,
                        errorType: 'joinLobby'
                    }
                }); 
            }
        };

        initializeLobby();

    }, []);

    return (
        <div>
            <lobbyIdContext.Provider value={lobbyId}>
            <userIdContext.Provider value={userId}>
            <nameContext.Provider value={name}>
            <ownerIdContext.Provider value={ownerId}>
                <Lobby/>
            </ownerIdContext.Provider>
            </nameContext.Provider>
            </userIdContext.Provider>
            </lobbyIdContext.Provider>

        </div>
    );
}

export default Room;
