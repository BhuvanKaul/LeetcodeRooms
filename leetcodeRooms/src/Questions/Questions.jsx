import React, { useEffect, useContext, useState, useRef } from 'react';
import { questionsContext, lobbyIdContext, userIdContext } from '../Contexts';
import styles from './Questions.module.css';
import { CircleQuestionMark } from 'lucide-react';
import submissionGuideImage from '../assets/submissionGuide.jpeg';
import { Check } from 'lucide-react';

function Questions() {
    const [questions, setQuestions] = useContext(questionsContext);
    const [solvedQuestions, setSolvedQuestions] = useState([]);
    const lobbyId = useContext(lobbyIdContext);
    const userId = useContext(userIdContext);
    const leetcodeUsernameRef = useRef(null);
    const leetcodeUsernameInputRef = useRef(null);

    useEffect(()=>{
        const getSolvedQuestions = async ()=>{
            try{
                const res = await fetch(`http://192.168.29.53:3000/lobbies/${lobbyId}/solvedQuestions?userId=${userId}`);
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

        try{
            if (!leetcodeUsername){
                throw Error('No Username');
            }
            const res = await fetch(`http://192.168.29.53:3000/lastSubmission?userName=${leetcodeUsername}`);
            if (!res.ok){
                throw Error('Bad Username');
            }

            const data = await res.json()
            const lastQuestion = data.lastQuestion;

            if (lastQuestion === question){

                const res = await fetch(`http://192.168.29.53:3000/lobbies/${lobbyId}/submit`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, question })
                });
                
                if (!res.ok){
                    throw Error('Server Error');
                }
                setSolvedQuestions([...solvedQuestions, question]);
            } else{
                console.log('Wrong Question');
            }   
        } catch(err){
            console.log('Bad UserName');
        }
    }

    return (
        <div className={styles.mainContainer}>
            
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
            
            

            {questions.map((question, index)=>(
            <div key={index} className={styles.questionContainer}>
                <a href={question} target="_blank" rel="noopener noreferrer">
                    Question {index + 1}
                </a>

                {!solvedQuestions.includes(question) &&
                    <button className={styles.submitButton} onClick={()=>handleSubmitQuestion(question)}> Submit</button>
                }

                {solvedQuestions.includes(question) &&
                    <Check className={styles.submittedIcon}/>
                }

            </div>
        ))}
        </div>
        
    )
}

export default Questions