import { Pool } from 'pg';
import format from 'pg-format';
import dotenv from 'dotenv';
dotenv.config();


const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
})


async function getActiveLobbies() {
    let query = `select lobbyID from lobby;`;
    let dbRes = await pool.query(query);
    dbRes = dbRes.rows;
    let activeIDs = new Set();
    for (const resRow of dbRes){
        activeIDs.add(resRow.lobbyid);
    }
    return activeIDs;
}

async function addNewLobby(lobbyID, ownerId) {
    let query = 'insert into lobby(lobbyid, ownerid) values($1, $2);';
    await pool.query(query, [lobbyID, ownerId]);
}

async function addUser(lobbyId, userId, name) {
    const query = `
        INSERT INTO lobby_members(lobbyid, userid, name) 
        VALUES($1, $2, $3) 
        ON CONFLICT (lobbyid, userid) 
        DO UPDATE SET 
            isActive = TRUE,
            name = EXCLUDED.name;
    `;
    await pool.query(query, [lobbyId, userId, name]);
};

async function removeUser(userId, lobbyId) {
    let query = 'UPDATE lobby_members SET isActive = FALSE WHERE lobbyid = $1 AND userid = $2;';
    await pool.query(query, [lobbyId, userId]);
}

async function getUsers(lobbyId){
    let query = 'SELECT name FROM lobby_members WHERE lobbyid = $1 AND isActive = TRUE;';
    const res = await pool.query(query, [lobbyId]);
    const users = [];
    for(const row of res.rows){
        users.push(row.name);
    }
    return users;
}

async function getOwner(lobbyId) {
    let query = 'select ownerid from lobby where lobbyid = $1;';
    const res = await pool.query(query, [lobbyId]);
    return res.rows;
}

async function addLobbyDetails(lobbyId, timeLimit){
    let query = 'update lobby set timelimit = $1, starttime = now() where lobbyid = $2;';
    await pool.query(query, [timeLimit, lobbyId]);
}

async function addQuestions(lobbyId, questions) {
    const pointsMap = {
        'Easy': 3,
        'Medium': 5,
        'Hard': 6
    };

    const values = questions.map(q => {
        const points = pointsMap[q.difficulty] || 0;
        return [lobbyId, q.link, points];
    });

    const query = format(
        'INSERT INTO questions(lobbyid, questionlink, points) VALUES %L ON CONFLICT (lobbyid, questionlink) DO NOTHING;',
        values
    );

    await pool.query(query);
};

async function getQuestions(lobbyId){
    const query = 'select questionlink, points from questions where lobbyid = $1;';
    const res = await pool.query(query, [lobbyId]);
    const data = res.rows;
    data.sort((a, b) => a.points - b.points);  

    const questions = [];
    for (const row of data){
        questions.push(row.questionlink);
    }
    return questions;
}

async function isStarted(lobbyId){
    const query = 'select starttime from lobby where lobbyid = $1;';
    const res = await pool.query(query, [lobbyId]);
    const data = res.rows[0];
    if (data.starttime){
        return true
    }
    return false;
}

async function getStartTime(lobbyId){
    const query = 'select starttime from lobby where lobbyid = $1;';
    const res = await pool.query(query, [lobbyId]);
    const data = res.rows[0];
    return data.starttime;

}

async function getTimeLimit(lobbyId) {
    const query = 'select timelimit from lobby where lobbyid = $1;';
    const res = await pool.query(query, [lobbyId]);
    const data = res.rows[0];
    return data.timelimit;
}

async function getSolvedQuestions(lobbyId, userId) {
    const query = 'select link from questions_solved where lobbyid=$1 and userid=$2;';
    const res = await pool.query(query, [lobbyId, userId]);
    const data = res.rows;
    const result = [];
    for(const question of data){
        result.push(question.link);
    }
    return result;
}

async function addSubmittedQuestion(lobbyId, userId, question){
    const query = 'insert into questions_solved(lobbyid, userid, link) values($1, $2, $3);';
    try{
        await pool.query(query, [lobbyId, userId, question]);
    } catch (err){
        throw Error('Bad Credentials');
    }
};

async function getLeaderboard(lobbyId){
    const query = `
        SELECT
            lm.name,
            SUM(q.points) AS total_points,
            MAX(qs.submitTime) AS last_submission_time,
            MIN(l.starttime) AS start_time 
        FROM
            questions_solved AS qs
        JOIN 
            questions AS q ON qs.lobbyid = q.lobbyid AND qs.link = q.questionlink
        JOIN 
            lobby_members AS lm ON qs.userid = lm.userid AND qs.lobbyid = lm.lobbyid
        JOIN 
            lobby AS l ON qs.lobbyid = l.lobbyid
        WHERE
            qs.lobbyid = $1
        GROUP BY
            lm.userid, lm.name
        ORDER BY
            total_points DESC,
            last_submission_time ASC;
    `

    const res = await pool.query(query, [lobbyId]);
    return res.rows;
};

async function fetchRandomQuestionsFromDB(topics, difficulty){
    if (topics === 'random'){
        const query = 'select title_slug, difficulty from leetcode_questions where difficulty = $1;';
        try{
            const res = await pool.query(query, [difficulty]);
            res.rows.sort(()=> 0.5 - Math.random());
            return res.rows;
        } catch(err){
            throw(err);
        }
    } 

    const query = 'select title_slug, difficulty from leetcode_questions where difficulty = $1 and topic_tags && $2;';
    try{
        const res = await pool.query(query, [difficulty, topics]);
        res.rows.sort(()=> 0.5 - Math.random());
        return res.rows;
    } catch(err){
        throw(err);
    }
};

async function generateQuestions(topics, totalQuestions, difficulty){
    let questions = [];

    if (difficulty === 'Easy'){
        const easyQs = await fetchRandomQuestionsFromDB(topics, "Easy");
        let needed = totalQuestions - easyQs.length;

        let mediumQs = [];
        if (needed > 0){
            mediumQs = await fetchRandomQuestionsFromDB(topics, "Medium");
            needed -= mediumQs.length;
        }

        let hardQs = [];
        if (needed > 0){
            hardQs = await fetchRandomQuestionsFromDB(topics, "Hard");
        }
        questions = [...easyQs, ...mediumQs, ...hardQs];

    } else if (difficulty === "Medium"){

        const mediumQs = await fetchRandomQuestionsFromDB(topics, "Medium");
        let needed = totalQuestions - mediumQs.length;

        let easyQs = [];
        if(needed > 0){
            easyQs = await fetchRandomQuestionsFromDB(topics, "Easy")
            needed -= mediumQs.length;
        }

        let hardQs = [];
        if(needed > 0){
            hardQs = await fetchRandomQuestionsFromDB(topics, "Hard");
        }

        questions = [...mediumQs, ...easyQs, ...hardQs];
    
    } else if(difficulty === "Hard"){
        
        const hardQs = await fetchRandomQuestionsFromDB(topics, "Hard");
        let needed = totalQuestions - hardQs.length;

        let mediumQs = [];
        if (needed > 0){
            mediumQs = await fetchRandomQuestionsFromDB(topics, "Medium");
            needed -= mediumQs.length;
        }
        
        let easyQs = [];
        if(needed > 0){
            easyQs = await fetchRandomQuestionsFromDB(topics, "Easy")
            needed -= mediumQs.length;
        }

        questions = [...hardQs, ...mediumQs, ...easyQs];
    
    } else if (difficulty === "Medium/Hard"){
        const mediumQs = await fetchRandomQuestionsFromDB(topics, "Medium");
        const hardQs = await fetchRandomQuestionsFromDB(topics, "Hard");
        const combined = [...mediumQs, ...hardQs].sort(()=>0.5 - Math.random());
        let needed = totalQuestions - combined.length;

        let easyQs = []
        if (needed > 0){
            easyQs = await fetchRandomQuestionsFromDB(topics, "Easy");
        }

        questions = [...combined, ...easyQs];
    
    } else if (difficulty === "Progressive"){

        const [allEasy, allMedium, allHard] = await Promise.all([
                fetchRandomQuestionsFromDB(topics, "Easy"),
                fetchRandomQuestionsFromDB(topics, "Medium"),
                fetchRandomQuestionsFromDB(topics, "Hard")
            ]);
                
        let idealCounts = {};
        if (totalQuestions === 2) idealCounts = { easy: 1, medium: 0, hard: 1 };
        else {
            const easyHardCount = Math.floor(totalQuestions / 3);
            idealCounts = {
                easy: easyHardCount,
                hard: easyHardCount,
                medium: totalQuestions - (2 * easyHardCount)
            };
        }

        const easyQuota = allEasy.slice(0, idealCounts.easy);
        const mediumQuota = allMedium.slice(0, idealCounts.medium);
        const hardQuota = allHard.slice(0, idealCounts.hard);
        
        let collectedQs = [...easyQuota, ...mediumQuota, ...hardQuota];
        let deficit = totalQuestions - collectedQs.length;

        if (deficit > 0) {
            const remainingMedium = allMedium.slice(idealCounts.medium);
            const remainingEasy = allEasy.slice(idealCounts.easy);
            const remainingHard = allHard.slice(idealCounts.hard);
            const fallbackPool = [...remainingMedium, ...remainingEasy, ...remainingHard];

            collectedQs.push(...fallbackPool);
        }

        questions = collectedQs;     
    }

    const finalQuestions = questions.slice(0, totalQuestions);
    const result = finalQuestions.map(({ title_slug, difficulty }) => ({
                    difficulty: difficulty,
                    link: `https://leetcode.com/problems/${title_slug}`
                    }));
    
    return result;
}

export {getActiveLobbies, addNewLobby, addUser, removeUser, getUsers, getOwner, 
        addLobbyDetails, addQuestions, getQuestions, isStarted, getStartTime, getTimeLimit, getSolvedQuestions,
        addSubmittedQuestion, getLeaderboard, generateQuestions};