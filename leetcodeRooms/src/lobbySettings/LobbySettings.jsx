import styles from './LobbySettings.module.css';
import { Settings, Shuffle } from 'lucide-react';
import { chosenTopicsContext, randomTopicContext } from '../Contexts';
import React, { useContext, useEffect } from 'react';

function LobbySettings() {
    const topics = ["Array", "String", "Hash Table", "Dynamic Programming", "Math", "Sorting", "Greedy", "Depth-First Search", 
                    "Binary Search", "Matrix", "Tree", "Breadth-First Search", "Bit Maniulation", "Two Pointers", "Prefix Sum", 
                    "Heap", "Binary Tree", "Graph", "Stack", "Sliding Window", "Backtracking", "Union Find", "Linked List", 
                    "Monotonic Stack", "Segment Tree", "Trie", "Queue", "Recursion", "Divide and Conquer", "Memoization",
                    "Binary Search Tree", "Topological Sort", "Monotonic Queue", "Doubly Linked List", "Minimum Spanning Tree"]

    const {chosenTopics, setChosenTopics} = useContext(chosenTopicsContext);
    const {randomTopic, setRandomTopic} = useContext(randomTopicContext);
    

    const handleTopicClick = (topic)=>{
        if (!chosenTopics.includes(topic)){
            setChosenTopics(ct => [...ct, topic])
        }
        else{
            setChosenTopics(chosenTopics.filter(element=>element !== topic))
        }
    }

    const handleRandomChange = ()=>{
        setRandomTopic(!randomTopic);
    }

    return (
        <div className={styles.settingsContainer}>

            <div className={styles.settingsHeading}>
                <Settings/>
                <h2>Lobby Settings</h2>
            </div>

            <div className={styles.topicTextRandomButtonContainer}>
                <p>Topics</p>
                <button 
                onClick={handleRandomChange} 
                className={randomTopic ? styles.randomOn : styles.randomOff}> 
                    <div className={styles.randomButtonContent}>
                        <Shuffle className={styles.randomIcon}/> Random 
                    </div>
                </button>
            </div>
            
            <div className={styles.topicsList}>
                {topics.map((topic, index)=>(
                            <div    key={index}
                                    onClick={()=>handleTopicClick(topic)}
                                    className={ randomTopic ? styles.noTopics :
                                                chosenTopics.includes(topic) ? styles.selectedTopic: styles.notSelectedTopic}>
                                    {topic}</div>
                ))}
            </div>

            <div className={styles.chosenTopics}>
                {randomTopic ? 'Random topics will be selected' : `${chosenTopics.length} topics selected`}
            </div>

            <div className={styles.lobbyOptionsContainer}>
                
                <div className={styles.numberOfQuestions}>
                    <p>Number of Questions</p>
                    <select defaultValue={"4"}>
                        <option value="2">2 Questions</option>
                        <option value="4">4 Questions</option>
                        <option value="6">6 Questions</option>
                        <option value="8">8 Questions</option>
                        <option value="10">10 Questions</option>
                    </select>
                </div>

                <div className={styles.timeLimit}>
                    <p>Time Limit</p>
                    <select defaultValue={"1.5"}>
                        <option value="0.5">30 Minutes</option>
                        <option value="1">1 Hour</option>
                        <option value="1.5">1 Hour 30 Minutes</option>
                        <option value="2">2 Hours</option>
                        <option value="3">3 Hours</option>
                    </select>
                </div>

                <div className={styles.difficulty}>
                    <p>Difficulty</p>
                    <select defaultValue={"Progressive"}>
                        <option value="Easy">Easy Only</option>
                        <option value="Medium">Medium Only</option>
                        <option value="Hard">Hard Only</option>
                        <option value="Medium/Hard">Medium and Hard</option>
                        <option value="Progressive">Progressive (Easy&nbsp;&rarr;&nbsp;Hard)</option>
                    </select>
                </div>

            </div>

        </div>
    )
}

export default React.memo(LobbySettings);