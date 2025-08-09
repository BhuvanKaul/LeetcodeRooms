import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useParams, useNavigate } from 'react-router-dom';
import Lobby from '../lobby/lobby.jsx';
import { lobbyIdContext, userIdContext, nameContext, ownerIdContext, competitionStarted, lobbyDetails, questionsContext } from '../Contexts.js';


function Room() {
    const navigate = useNavigate();
    const {lobbyId} = useParams();
    const userId = localStorage.getItem('userId') || uuidv4();
    localStorage.setItem('userId',userId);
    const [ownerId, setOwnerId] = useState(null);
    const [started, setStarted] = useState(false);
    const [questions, setQuestions] = useState([]);

    const lobbyTopics = useRef('random');
    const numberOfQues = useRef(4);
    const timeLimit = useRef(90);
    const difficulty = useRef('Progressive');

    const name = localStorage.getItem('name') || 'Smarty Pants';

    useEffect(() => {
        const initializeLobby = async () => {
            try {
                const joinRes = await fetch(`http://192.168.1.55:3000/lobbies/${lobbyId}/join`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, name })
                });

                if (!joinRes.ok) {
                    throw new Error('Could not join lobby. It may not exist or is full.');
                }

                const ownerRes = await fetch(`http://192.168.1.55:3000/lobbies/${lobbyId}/owner`);
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

    useEffect(()=>{
        if (started){
            const sendInfo = async()=>{
                await fetch(`http://192.168.1.55:3000/lobbies/${lobbyId}/info`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        lobbyTopics:lobbyTopics.current, 
                        numberOfQues: numberOfQues.current,
                        timeLimit: timeLimit.current, 
                        difficulty: difficulty.current
                    })
                
                })
                
                const res = await fetch(`http://192.168.1.55:3000/lobbies/${lobbyId}/questions`);
                const data = await res.json();
                setQuestions(data.questions);
            }

            sendInfo();
        }
    }, [started])

    return (
        <div>
            <lobbyIdContext.Provider value={lobbyId}>
            <userIdContext.Provider value={userId}>
            <nameContext.Provider value={name}>
            <ownerIdContext.Provider value={ownerId}>
            <competitionStarted.Provider value={[started, setStarted]}>
            <lobbyDetails.Provider value={{lobbyTopics, numberOfQues, timeLimit, difficulty}}>
            <questionsContext.Provider value={[questions, setQuestions]}>
                <Lobby/>
            </questionsContext.Provider>
            </lobbyDetails.Provider>
            </competitionStarted.Provider>
            </ownerIdContext.Provider>
            </nameContext.Provider>
            </userIdContext.Provider>
            </lobbyIdContext.Provider>

        </div>
    );
}

export default Room;
