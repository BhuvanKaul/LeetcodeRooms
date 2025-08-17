import React, { useEffect, useContext, useState, useRef } from 'react';
import { questionsContext, lobbyIdContext, userIdContext, socketContext} from '../Contexts';
import styles from './Questions.module.css';
import { CircleQuestionMark } from 'lucide-react';
import submissionGuideImage from '../assets/submissionGuide.jpeg';
import { Check } from 'lucide-react';
import Leaderboard from '../Leaderboard/Leaderboard';
import { ListTodo, Trophy } from 'lucide-react';
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
    const [submittingQuestion, setSubmittingQuestion] = useState(null);
    const [showWrongQuestionError, setShowWrongQuestionError] = useState(false);
    const [showBadUsernameError, setShowBadUsernameError] = useState(false);

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

    const handleSubmitQuestion = async(question) => {
        const leetcodeUsername = leetcodeUsernameRef.current;
        setSubmittingQuestion(question);
        
        try{
            if (!leetcodeUsername){
                throw Error('No Username');
            }
            const res = await fetch(`${serverIP}/lastSubmission?userName=${leetcodeUsername}`);
            if (!res.ok){
                throw Error('Bad Username');
            }

            const data = await res.json()
            const lastQuestion = data.lastQuestion;

            if (lastQuestion === question){

                const res = await fetch(`${serverIP}/lobbies/${lobbyId}/submit`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, question })
                });
                
                if (!res.ok){
                    throw Error('Server Error');
                }
                setSolvedQuestions([...solvedQuestions, question]);
                
                if (socketRef.current){
                    socketRef.current.emit('new-submission', {lobbyId});
                }
            } else{
                setShowWrongQuestionError(true);
                setSubmittingQuestion(null);
            }   
        } catch(err){
            setShowBadUsernameError(true);
            setSubmittingQuestion(null);
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
                    Incorrect question submitted. Please solve the correct one.
                </div>
            )}

            {showBadUsernameError && (
                <div className="errorMessage">
                    No such User found! Enter your leetcode username carefully.
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
                            <p>
                                To submit a question, firstly enter the Leetcode username of the
                                account you are using, then solve the question on Leetcode itself and submit it there. 
                                When your solution is accepted, submit the question on LeetRooms. 
                                Make sure the question you are submitting appears on top of 
                                your Recent Submission list as shown in the image. 
                                <br />
                                <i>If you have already solved the question, 
                                submit again on Leetcode so the question appears on top of you recent submission list.</i>
                            </p>
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
                                        onClick={() => handleSubmitQuestion(question)}
                                        disabled={submittingQuestion}
                                    >
                                        {submittingQuestion === question ? (
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