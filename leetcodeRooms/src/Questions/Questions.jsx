import React, { useEffect, useContext, useState, useRef } from 'react';
import { questionsContext, lobbyIdContext, userIdContext, socketContext, lobbyOverContext, nameContext} from '../Contexts';
import styles from './Questions.module.css';
import { CircleQuestionMark } from 'lucide-react';
import submissionGuideImage from '../assets/submissionGuide.webp';
import { Check } from 'lucide-react';
import Leaderboard from '../Leaderboard/Leaderboard';
import { FaTasks, FaTrophy } from 'react-icons/fa';

function Questions() {
    const serverIP = import.meta.env.VITE_SERVER_IP;
    const [questions, setQuestions] = useContext(questionsContext);
    const [solvedQuestions, setSolvedQuestions] = useState([]);
    const lobbyId = useContext(lobbyIdContext);
    const userId = useContext(userIdContext);
    const leetcodeUsernameRef = useRef(null);
    const leetcodeUsernameInputRef = useRef(null);
    const socketRef = useContext(socketContext);
    const [showQuestions, setShowQuestions] = useState(true);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [submittingQuestion, setSubmittingQuestion] = useState([]);
    const [showWrongQuestionError, setShowWrongQuestionError] = useState(false);
    const [showBadUsernameError, setShowBadUsernameError] = useState(false);
    const [lobbyOver, setLobbyOver] = useContext(lobbyOverContext);
    const name = useContext(nameContext);


    useEffect(() => {
        if (showWrongQuestionError) {
            const timer = setTimeout(() => {
                setShowWrongQuestionError(false);
            }, 4000);

            return () => clearTimeout(timer);
        }
    }, [showWrongQuestionError]);

    useEffect(() => {
        if (showBadUsernameError) {
            const timer = setTimeout(() => {
                setShowBadUsernameError(false);
            }, 4000);

            return () => clearTimeout(timer);
        }
    }, [showBadUsernameError]);

    useEffect(()=>{
        const getSolvedQuestions = async ()=>{
            try{
                const res = await fetch(`${serverIP}/lobbies/${lobbyId}/solvedQuestions?userId=${userId}`);
                if (!res.ok){
                    throw Error('Bad Response from server when getting solved questions');
                }
                const data = await res.json();
                const questionsSolved = data.solvedQuestions;
                setSolvedQuestions(questionsSolved);
            } catch(err){
                console.log(err);
            }
        }
        getSolvedQuestions();
    }, [])

    
    const getleetcodeUsername = ()=>{
        leetcodeUsernameRef.current = leetcodeUsernameInputRef.current.value;
    }

    const handleSubmitQuestion = async(question, questionNumber) => {
        setSubmittingQuestion(prvs => [...prvs, question]);
        const leetcodeUsername = leetcodeUsernameRef.current;
        
        try{
            if (!leetcodeUsername){
                throw Error('No Username');
            }
            const res = await fetch(`${serverIP}/latestSubmission?userName=${leetcodeUsername}`);
            if (!res.ok){
                throw Error('Bad Username');
            }

            const data = await res.json()
            const latestQuestion = data.latestQuestion;
            if (latestQuestion.length === 0){
                throw Error('Bad Username');
            }

            if (latestQuestion.includes(question)){

                const res = await fetch(`${serverIP}/lobbies/${lobbyId}/submit`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, question })
                });
                console.log(res);
                if (!res.ok){
                    throw Error('Server Error');
                }
                setSolvedQuestions(prvs => [...prvs, question]);
                
                if (socketRef.current){
                    socketRef.current.emit('new-submission', {lobbyId, questionNumber, name});
                }
            } else{
                setShowWrongQuestionError(true);
            }   
        } catch(err){
            setShowBadUsernameError(true);
        } finally{
            setSubmittingQuestion(prvs => prvs.filter(q => q !== question));
        }
    }

    const handleShowQuestions = ()=>{
        setShowQuestions(true);
        setShowLeaderboard(false);
    }

    const handleShowLeaderBoard = () =>{
        setShowLeaderboard(true);
        setShowQuestions(false);
    }

    return (
        <div className={styles.mainContainer}>

            {showWrongQuestionError && (
                <div className="errorMessage">
                    Incorrect question submitted. Please submit the correct one.
                </div>
            )}

            {showBadUsernameError && (
                <div className="errorMessage">
                    No such user found or no questions solved!
                </div>
            )}

            <div className={styles.questionLeaderboardChoice}>
                <div onClick={handleShowQuestions} className={showQuestions ? styles.activeTab : ''}> 
                    <FaTasks className={styles.icons}/> 
                    <span>Questions</span>
                </div>
                <div onClick={handleShowLeaderBoard} className={!showQuestions ? styles.activeTab : ''}>
                    <FaTrophy className={styles.icons}/> 
                    <span>Ranking</span>
                </div>
            </div>
            

            {showQuestions && 
                <div className={styles.matchContainer}>
                    <div className={styles.userNameContainer}>
                        <span>
                            Enter Leetode Username
                        </span>
                        <input type="text" placeholder='Leetcode Username' onChange={getleetcodeUsername} ref={leetcodeUsernameInputRef}/>
                    </div>

                    <div className={styles.guideContainer}>
                        <div className={styles.submitGuide}>
                            <CircleQuestionMark className={styles.questionMarkIcon} />
                            How to Submit?
                        </div>

                        <div className={styles.submitHelper}>
                            <ol>
                                <li>Enter Leetcode Username</li>
                                <li>Solve and submit the question on leetcodes</li>
                                <li>Submit on LeetRooms</li>
                            </ol>
                            <i>
                                <p className={styles.margin_bottom}>Please make sure that the submission is within your 3 most recent submissions  </p>   
                                <p>
                                    If question is already solve, submit again so it appears on top of your
                                    recent submissions.
                                </p>                           

                            </i>
                            <img src={submissionGuideImage} className={styles.image}/>
                        </div>
                    </div>

                    <div className={styles.allQuestionsContainer}>
                        {questions.map((question, index)=>(
                            <div key={index} className={styles.questionContainer}>
                                <a href={question} target="_blank" rel="noopener noreferrer">
                                    Question {index + 1}
                                </a>

                                {!solvedQuestions.includes(question) &&
                                    <button
                                        className={styles.submitButton}
                                        onClick={() => handleSubmitQuestion(question, index + 1)}
                                        disabled={lobbyOver || submittingQuestion.includes(question)}
                                    >
                                        {submittingQuestion.includes(question) ? (
                                            <div className={styles.loader}></div>
                                        ) : (
                                            'Submit'
                                        )}
                                    </button>
                                }

                                {solvedQuestions.includes(question) &&
                                    <Check className={styles.submittedIcon}/>
                                }

                            </div>
                        ))}
                    </div>
                </div>
            }
            
            {showLeaderboard &&
                <Leaderboard/>
            }
            

        </div>
        
    )
}

export default Questions