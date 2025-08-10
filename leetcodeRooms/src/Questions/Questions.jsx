import React, { useEffect, useContext } from 'react';
import { questionsContext } from '../Contexts';
import styles from './Questions.module.css';

function Questions() {
    const [questions, setQuestions] = useContext(questionsContext); 

    return (
        <div className={styles.mainContainer}>
            {questions.map((question, index)=>(
            <div key={index} className={styles.questionContainer}>
                <a href={question} target="_blank" rel="noopener noreferrer">
                    Question {index + 1}
                </a>
                <button className={styles.submitButton}> Submit</button>
            </div>
        ))}
        </div>
        
    )
}

export default Questions