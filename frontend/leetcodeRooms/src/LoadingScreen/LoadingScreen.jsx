import styles from './LoadingScreen.module.css'

function LoadingScreen(props) {
    const text = props.text
    return (
        <div className={styles.loaderBackdrop}>
            <div className={styles.dotsContainer}>
                <div className={`${styles.dot} ${styles.dotOne}`}></div>
                <div className={`${styles.dot} ${styles.dotTwo}`}></div>
                <div className={`${styles.dot} ${styles.dotThree}`}></div>
            </div>
            <p className={styles.loadingText}>{text}</p>
        </div>
    )
}

export default LoadingScreen