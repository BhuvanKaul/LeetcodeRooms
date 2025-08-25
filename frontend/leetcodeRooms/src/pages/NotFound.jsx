import styles from './NotFoundPage.module.css';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

function NotFound() {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <AlertTriangle className={styles.icon} />
                <h1 className={styles.heading}>404</h1>
                <p className={styles.subheading}>Page Not Found</p>
                <p className={styles.text}>
                    Sorry, the page you are looking for does not exist or has been moved.
                </p>
                <Link to="/" className={styles.homeButton}>
                    Return to Home
                </Link>
            </div>
        </div>
    );
}

export default NotFound;