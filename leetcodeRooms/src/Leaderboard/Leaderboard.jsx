import { useContext } from "react";
import { leaderboardContext } from "../Contexts";


function Leaderboard() {

    const [leaderboard, setLeaderboard] = useContext(leaderboardContext);

    return (
        <>
        {leaderboard.length === 0 &&
            <div>
                Waiting for Submissions...
            </div>
        }

        {leaderboard.length > 0 &&
            <div>
                {leaderboard.map((user, index) => (
                    <div key={index}>
                        {user.name}
                    </div>
                ))}
            </div>
        }
        
        </>
    )
}

export default Leaderboard