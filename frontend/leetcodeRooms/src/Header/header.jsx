import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './header.module.css'

function Header() {
    return(
        <div className={styles.headerContainer}>
            <div className={styles.heading}>
                <div className={styles.logoContainer}>
                    <ChevronLeft className={`${styles.codeLogo} ${styles.chevronLeft}`} />
                    <ChevronRight className={`${styles.codeLogo} ${styles.chevronRight}`} />
                </div>
                <h1 className={styles.websiteName}>LeetJam</h1>
            </div>
            <p>Leetcode with Friends!</p>
            <p>Create lobbies, invite friends, and compete in real-time coding challenges.</p>
        </div>
    )
}

export default Header;