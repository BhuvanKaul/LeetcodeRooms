import CreateCard from "../CreateCard/createCard.jsx";
import JoinCard from "../JoinCard/joinCard.jsx";
import Header from "../Header/header.jsx";
import Footer from "../Footer/footer.jsx";
import CreateRoomPopup from "../CreateRoomPopup/createRoomPopup.jsx";
import {Heart} from 'lucide-react';
import {React, useEffect, useState} from 'react';
import JoinRoomPopup from "../JoinRoomPopup/joinRoomPopup.jsx";

function Home(){
    const [showCreatePopup, setShowCreatePopup] = useState(false);
    const [showJoinPopup, setShowJoinPopup] = useState(false);

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

    return(
        <div className="main-container">
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
            {showCreatePopup && <CreateRoomPopup showPopup={showCreatePopup} setShowPopup={setShowCreatePopup}/>}
            {showJoinPopup && <JoinRoomPopup showPopup={showJoinPopup} setShowPopup={setShowJoinPopup}/>}
        </div>

        
    )
}

export default Home;