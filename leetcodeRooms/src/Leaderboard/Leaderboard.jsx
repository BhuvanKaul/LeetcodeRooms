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
                {leaderboard.map((user) => (
                    <div key={user.userid}>
                        {user.userid}
                    </div>
                ))}
            </div>
        }
        
        </>
    )
}

export default Leaderboard