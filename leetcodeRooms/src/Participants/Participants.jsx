import styles from './Participants.module.css';
import {Users} from 'lucide-react';
import React, { useContext } from 'react';
import { participantsContext } from '../Contexts';

function Participants() {
    const {participants, setParticipants} = useContext(participantsContext);
    return (

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
    )
}

export default React.memo(Participants);