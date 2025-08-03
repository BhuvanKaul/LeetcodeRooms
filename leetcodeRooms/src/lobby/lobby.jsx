import LobbyHeader from "../lobbyHeader/lobbyHeader";
import styles from './lobby.module.css';
import ChatRoom from "../chatRoom/ChatRoom";
import {Users, Settings} from 'lucide-react';
import { useState } from "react";
import { participantsContext } from "../Contexts.js";

function Lobby() {
    const [participants, setParticipants] = useState([]);
    const topics = ["Array", "String", "Hash Table", "Dynamic Programming", "Math", "Sorting", "Greedy", "Depth-First Search", 
                    "Binary Search", "Matrix", "Tree", "Breadth-First Search", "Bit Maniulation", "Two Pointers", "Prefix Sum", 
                    "Heap", "Binary Tree", "Graph", "Stack", "Sliding Window", "Backtracking", "Union Find", "Linked List", 
                    "Monotonic Stack", "Segment Tree", "Trie", "Queue", "Recursion", "Divide and Conquer", "Memoization",
                    "Binary Search Tree", "Topological Sort", "Monotonic Queue", "Doubly Linked List", "Minimum Spanning Tree"]
    return (
        <div>
            <LobbyHeader/>
            <div className={styles.mainContainer}>

                <div className={styles.lobbyInfo}>

                    <div className={styles.participantsContainer}>
                        <div className={styles.participantsHeading}>
                            <Users/>
                            <h2>Participants ({participants.length})</h2>
                        </div>
                        <div className={styles.participantsName}>
                            {participants.map((user, index) =>
                            <div key={index}>
                                {user}
                            </div>)}
                        </div>


                    </div>

                    <div className={styles.settingsContainer}>
                        <div className={styles.settingsHeading}>
                            <Settings/>
                            <h2>Lobby Settings</h2>
                        </div>
                        <div className={styles.topicsList}>
                            {topics.map((topic, index)=>(
                                        <div key={index}>{topic}</div>
                            ))}
                        </div>
                    </div>

                </div>

                <div className={styles.chatContainer}>
                    <participantsContext.Provider value={setParticipants}>
                        <ChatRoom />
                    </participantsContext.Provider>
                </div>
            </div>
        </div>
    ) 
}

export default Lobby