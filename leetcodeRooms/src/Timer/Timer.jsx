import { useEffect, useState, useRef, useContext } from "react";
import styles from './Timer.module.css';
import { startTimeContext, timeLimitContext, lobbyOverContext } from  '../Contexts';

const padWithZero = (num) => num.toString().padStart(2, '0');

function Timer() {
    const startTimeRef = useContext(startTimeContext);
    const timeLimitRef = useContext(timeLimitContext);
    const timerRef = useRef(null);
    const [timeLeft, setTimeLeft] = useState({
        hours: '00',
        minutes: '00',
        seconds: '00',
    });
    const [lobbyOver, setLobbyOver] = useContext(lobbyOverContext);

    useEffect(() => {
        if (!startTimeRef.current || !timeLimitRef.current) {
        return;
        }

        const startDateTime = new Date(startTimeRef.current);
        const endTime = new Date(startDateTime.getTime() + timeLimitRef.current * 60 * 1000);

        const updateTimer = () => {
            const now = new Date();
            const difference = endTime.getTime() - now.getTime();

            if (difference <= 0) {
                setTimeLeft({ hours: '00', minutes: '00', seconds: '00' });
                setLobbyOver(true);
                return false;
            }

            const hours = Math.floor(difference / (1000 * 60 * 60));
            const minutes = Math.floor((difference / 1000 / 60) % 60);
            const seconds = Math.floor((difference / 1000) % 60);

            setTimeLeft({
                hours: padWithZero(hours),
                minutes: padWithZero(minutes),
                seconds: padWithZero(seconds),
            });
            return true;
        };

        const msUntilNextSecond = 1000 - new Date().getMilliseconds();
        let intervalId;
        const timeoutId = setTimeout(() => {
        if (updateTimer()) { 
            intervalId = setInterval(updateTimer, 1000);
        }
        }, msUntilNextSecond);

        return () => {
        clearTimeout(timeoutId);
        clearInterval(intervalId);
        };
        
    }, [startTimeRef.current, timeLimitRef.current]);

    return (
        <div ref={timerRef} className={`${styles.timerContainer} ${timeLeft.hours === '00' && timeLeft.minutes < '10' ? styles.lowTime: ''}`}>
            <span>{timeLeft.hours}</span>:
            <span>{timeLeft.minutes}</span>:
            <span>{timeLeft.seconds}</span>
        </div>
    )
}

export default Timer