import { useEffect, useState } from "react";
import styles from './DeletionTimer.module.css';
import { competitionStarted } from "../Contexts";

const padWithZero = (num) => num.toString().padStart(2, '0');

function DeletionTimer({ competitionEndTime }) {
    const [timeLeft, setTimeLeft] = useState(null);
    const extraTime = 30;

    useEffect(()=>{
        if (!competitionStarted){
            console.log("sad");
            return;
        }

        const deletionTime = new Date(new Date(competitionEndTime).getTime() + extraTime*60*1000);
        const updateTimer = () =>{
            const now = new Date();
            const difference = deletionTime.getTime() - now.getTime();

            if (difference <= 0){
                setTimeLeft(null);
                return;
            }

            const minutes = Math.floor((difference / 1000 / 60) % 60);
            const seconds = Math.floor((difference/1000) % 60);

            setTimeLeft({
                minutes: padWithZero(minutes),
                seconds: padWithZero(seconds)
            });

        };

        updateTimer();
        const intervalId = setInterval(updateTimer, 1000);

        return () => clearInterval(intervalId);

    }, [competitionEndTime])

    if(!timeLeft){
        return (
            <div className={styles.timerContainer}>
                Lobby will soon be deleted
            </div>
        )
    }

    return (
        <div className={styles.timerContainer}>
            <span className={styles.timerLabel}> Lobby deletes in: </span>
            <span> {timeLeft.minutes} </span> :
            <span> {timeLeft.seconds} </span>
        </div>
    )
}

export default DeletionTimer