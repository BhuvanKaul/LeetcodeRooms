import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useParams, useNavigate } from 'react-router-dom';
import Lobby from '../lobby/lobby.jsx';
import { lobbyIdContext, userIdContext, nameContext, ownerIdContext, competitionStarted, lobbyDetails, 
        questionsContext, sendDataContext, startTimeContext, timeLimitContext, lobbyInitializationContext } from '../Contexts.js';
import LoadingScreen from '../LoadingScreen/LoadingScreen.jsx';

function Room() {
    const serverIP = import.meta.env.VITE_SERVER_IP;
    const navigate = useNavigate();
    const {lobbyId} = useParams();
    const userId = localStorage.getItem('userId') || uuidv4();
    localStorage.setItem('userId',userId);
    const [ownerId, setOwnerId] = useState(null);
    const [started, setStarted] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [sendData, setSendData] = useState(false);
    const startTimeRef = useRef(null);
    const timeLimitRef = useRef(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [showStartError, setShowStartError] = useState(false);

    const lobbyTopics = useRef('random');
    const numberOfQues = useRef(4);
    const timeLimit = useRef(90);
    const difficulty = useRef('Progressive');

    const name = localStorage.getItem('name') || 'Smarty Pants';

        useEffect(() => {
            if (showStartError) {
                const timer = setTimeout(() => {
                    setShowStartError(false);
                }, 4000); // Hide after 4 seconds

                return () => clearTimeout(timer);
            }
        }, [showStartError]);

    useEffect(() => {
        const initializeLobby = async () => {
            try {
                const joinRes = await fetch(`${serverIP}/lobbies/${lobbyId}/join`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, name })
                });

                if (!joinRes.ok) {
                    throw new Error('Could not join lobby. It may not exist or is full.');
                }

                const data = await joinRes.json();
                setOwnerId(data.ownerId);
                setStarted(data.start);
                setIsInitialized(true);

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


useEffect(() => {
    if (sendData) {
        const startCompetition = async () => {
            try {
                const res = await fetch(`${serverIP}/lobbies/${lobbyId}/info`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        lobbyTopics: lobbyTopics.current, 
                        numberOfQues: numberOfQues.current,
                        timeLimit: timeLimit.current, 
                        difficulty: difficulty.current
                    })
                });

                if(!res.ok){
                    throw Error('Could Not start Lobby');
                }
                
                setSendData(false);
                setStarted(true);

            } catch (error) {
                setSendData(false);
                setShowStartError(true);
            }
        };

        startCompetition();
    }
}, [sendData]);


useEffect(()=>{
    if (started){
        const getLobbyInfo = async()=>{
            const lobbyInfo = await fetch(`${serverIP}/lobbies/${lobbyId}/info`);
            if (!lobbyInfo.ok) {
                throw new Error('Could not get Questions after starting competition');
            }
            const lobbyData = await lobbyInfo.json();
            
            setQuestions(lobbyData.questions);
            startTimeRef.current = lobbyData.startTime;
            timeLimitRef.current = lobbyData.timeLimit;
            
        }
        getLobbyInfo();
    }

}, [started])


    return (
        <div>
            {showStartError && (
                <div className="errorMessage">
                    Failed to start lobby. Please try again.
                </div>
            )}
            <lobbyIdContext.Provider value={lobbyId}>
            <userIdContext.Provider value={userId}>
            <nameContext.Provider value={name}>
            <ownerIdContext.Provider value={ownerId}>
            <competitionStarted.Provider value={[started, setStarted]}>
            <lobbyDetails.Provider value={{lobbyTopics, numberOfQues, timeLimit, difficulty}}>
            <questionsContext.Provider value={[questions, setQuestions]}>
            <sendDataContext.Provider value={[sendData, setSendData]}>
            <startTimeContext.Provider value={startTimeRef}>
            <timeLimitContext.Provider value={timeLimitRef}>
            <lobbyInitializationContext.Provider value={isInitialized}>
                {isInitialized? <Lobby /> : <LoadingScreen text="Joining Lobby ..." />}
            </lobbyInitializationContext.Provider>
            </timeLimitContext.Provider>
            </startTimeContext.Provider>
            </sendDataContext.Provider>
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
