import { Code, Mail} from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import styles from './footer.module.css'

function Footer(){
    return(
        <div className={styles.footerContainer}>
            <div className={styles.aboutLeetRoomsContainer}>
                <div className={styles.aboutLeetRoomsHeading}>
                    <div className={styles.logoContainer}>
                        <Code className={styles.codeLogo}/>
                    </div>
                    <h2 className={styles.websiteName}>LeetRooms</h2>
                </div>
                <p>Leetcode with friends! Hell yeah.</p>
            </div>

            <div className={styles.aboutMeContactMeContainer}>
                <div className={styles.aboutMeContainer}> 
                    <h3>About Me</h3>
                    <p>I am a final year CS Student from India, looking for Internships and Jobs!</p>
                </div>

                <div className={styles.contactMeContainer}>
                    <div className={styles.contactMeText}>Contact Me</div>

                    <div className={styles.contactMeIcons}>
                        <a href="https://www.linkedin.com/in/bhuvan-kaul-4609bb259/" target="_blank" rel="noopener noreferrer">
                            <FaLinkedin className={styles.linkedinLogo}/>
                        </a>
                        <a href="https://github.com/BhuvanKaul" target="_blank" rel="noopener noreferrer">
                            <FaGithub className={styles.githubLogo}/>
                        </a>
                        <a href="mailto:bhuvan.kaul9@gmail.com">
                            <Mail className={styles.gmailLogo}/>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Footer;