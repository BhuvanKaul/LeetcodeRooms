import { useContext } from "react";
import { leaderboardContext } from "../Contexts";
import styles from './Leaderboard.module.css';
import { Crown } from 'lucide-react';

const formatDuration = (start, end) => {
    const diff = new Date(end) - new Date(start);
    if (isNaN(diff) || diff < 0) return '00:00';

    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(seconds).padStart(2, '0');

    if (hours > 0) {
        return `${hours}:${paddedMinutes}:${paddedSeconds}`;
    }
    return `${paddedMinutes}:${paddedSeconds}`;
};

function Leaderboard() {

    const [leaderboard, setLeaderboard] = useContext(leaderboardContext);

    return (
        <div className={styles.leaderboardContainer}>
            {leaderboard.length === 0 &&
            <div className={styles.emptyState}>
                Waiting for Submissions...
            </div>
            }

            {leaderboard.length > 0 && (
                <div className={styles.leaderboardTable}>
                    <div className={styles.headerRow}>
                        <div className={styles.rank}>Rank</div>
                        <div className={styles.player}>Player</div>
                        <div className={styles.score}>Score</div>
                        <div className={styles.time}>Time</div>
                    </div>

                    {leaderboard.map((user, index) => (
                        <div key={index} className={styles.userRow}>
                            <div className={styles.rank}>
                                {index === 0 ? (
                                    <Crown className={styles.crownIcon} />
                                ) : (
                                    `#${index + 1}`
                                )}
                            </div>
                            <div className={styles.player}>{user.name}</div>
                            <div className={styles.score}>{user.total_points}</div>
                            <div className={styles.time}>
                                {formatDuration(user.start_time, user.last_submission_time)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    
    )
}

export default Leaderboard