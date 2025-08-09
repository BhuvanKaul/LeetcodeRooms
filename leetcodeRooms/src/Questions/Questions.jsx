import React, { useEffect, useContext } from 'react';
import { questionsContext } from '../Contexts';

function Questions() {
    const [questions, setQuestions] = useContext(questionsContext); 

    return (
        questions.map((question, index)=>(
            <div key={index}>
                <a href={question}>question {index + 1}</a>
            </div>
        ))
    )
}

export default Questions