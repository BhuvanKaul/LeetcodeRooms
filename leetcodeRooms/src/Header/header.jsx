import {Code} from 'lucide-react';
import styles from './header.module.css'

function Header() {
    return(
        <div className={styles.headerContainer}>
            <div className={styles.heading}>
                <div className={styles.logoContainer}>
                    <Code className={styles.codeLogo}/>
                </div>
                <h1 className={styles.websiteName}>LeetRooms</h1>
            </div>
            <p>Leetcode with Friends!</p>
            <p>Create lobbies, invite friends, and compete in real-time coding challenges.</p>
        </div>
    )
}

export default Header;