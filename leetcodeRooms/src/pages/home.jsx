import CreateCard from "../CreateCard/createCard.jsx";
import JoinCard from "../JoinCard/joinCard.jsx";
import Header from "../Header/header.jsx";
import Footer from "../Footer/footer.jsx";
import CreateRoomPopup from "../CreateRoomPopup/createRoomPopup.jsx";
import {Heart} from 'lucide-react';
import { useEffect, useState} from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import JoinRoomPopup from "../JoinRoomPopup/joinRoomPopup.jsx";

function Home(){
    const [showCreatePopup, setShowCreatePopup] = useState(false);
    const [showJoinPopup, setShowJoinPopup] = useState(false);
    const [showJoinLobbyError, setShowJoinLobbyError] = useState(false);
    const [showCreateLobbyError, setShowCreateLobbyError] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(()=>{
        if (showCreatePopup || showJoinPopup){
            document.body.style.overflow = 'hidden';
        } else{
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [showCreatePopup, showJoinPopup]);

    useEffect(() => {
        if (location.state?.errorType === "joinLobby") {
            setShowJoinLobbyError(true);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate]);

    useEffect(()=>{
        if (showCreateLobbyError){

            const timeOutId = setTimeout(()=>{
                setShowCreateLobbyError(false);
            },4000);
        
            return () => { clearTimeout(timeOutId); }
        }
    }, [showCreateLobbyError])

    useEffect(()=>{
        if (showJoinLobbyError){

            const timeOutId = setTimeout(()=>{
                setShowJoinLobbyError(false);
            },4000);
        
            return () => { clearTimeout(timeOutId); }
        }
    }, [showJoinLobbyError])

    return(
        <div className="main-container">
            
            {showJoinLobbyError && 
            <div className="errorMessage">Invalid Lobby ID</div>
            }

            {showCreateLobbyError && 
            <div className="errorMessage">Experiencing high traffic. Please try again later</div>
            }

            <Header/>
            <div className="createJoinCardsContainer">
                <CreateCard showPopup={showCreatePopup} setShowPopup={setShowCreatePopup}/>
                <JoinCard showPopup={showJoinPopup} setShowPopup={setShowJoinPopup}/>
            </div>
            <Footer/>
            <div className="finale">
                <p>Made with</p>
                <div className="heartContainer">
                    <Heart className="heart"/>
                </div>
            </div>
            {showCreatePopup && <CreateRoomPopup    showPopup={showCreatePopup} 
                                                    setShowPopup={setShowCreatePopup} 
                                                    setShowCreateLobbyError={setShowCreateLobbyError} />}

            {showJoinPopup && <JoinRoomPopup    showPopup={showJoinPopup} 
                                                setShowPopup={setShowJoinPopup}/>}
        </div>

        
    )
}

export default Home;