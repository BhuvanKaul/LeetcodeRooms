import styles from './NotOwner.module.css';
import { Clock } from 'lucide-react';

function NotOwner() {
  return (
    <div className={styles.NoOwnerContainer}>

        <div className={styles.contentContainer}>

            <Clock className={styles.clockIcon} />

            <div className={styles.heading}>
                Competition Setup in Progress
            </div>

            <div className={styles.text}>
                The room owner is currently configuring the competition settings. Please wait while they finalize the topics, difficulty, and other parameters.
            </div>

            <div className={styles.threeDots}>
                <div className={styles.dotOne}></div>
                <div className={styles.dotTwo}></div>
                <div className={styles.dotThree}></div>
            </div>

        </div>

    </div>
  )
}

export default NotOwner