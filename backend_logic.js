function getRandomNumber(){
    return Math.floor(Math.random()*10);
}

function getRandomCapLetter(){
    return String.fromCharCode(Math.floor(Math.random()*26) + 65);
}

function makeLobbyID(){
    let id = '';

    for (let i=0; i<5; i++){
        if (Math.random() > 0.5){
            id += getRandomCapLetter();
        }else{
            id += getRandomNumber();
        }
    }

    return id;
}

const url = "https://leetcode.com/graphql";
const gqlQuery = `
query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
  problemsetQuestionList: questionList(categorySlug: $categorySlug, limit: $limit, skip: $skip, filters: $filters) {
    total: totalNum
    questions: data {
      title
      titleSlug
      difficulty
      isPaidOnly
    }
  }
}`;

const headers = {
    "Content-Type": "application/json",
    "User-Agent": "PostmanRuntime/7.45.0",
    "Accept": "*/*",
    "Connection": "keep-alive",
    "Accept-Encoding": "identity"
}

async function fetchRandomQuestionsFromPool(count, filters) {
    if (count <= 0) return [];

    const body = {
        query: gqlQuery,
        variables:{
            categorySlug: "",
            filters: filters,
            limit: 4000
        }
    }

    const allQuestionsResponse = await fetch(url, {method: 'POST', headers: headers, body: JSON.stringify(body)});
    const allQuestionsData = await allQuestionsResponse.json();
    const allQuestions = allQuestionsData.data.problemsetQuestionList.questions;

    const freeQuestions = allQuestions.filter(q => q && !q.isPaidOnly);

    if (freeQuestions.length === 0){
        return [];
    }

    const shuffled = freeQuestions.sort(()=> 0.5 - Math.random());
    return shuffled.slice(0, count);
}


async function generateQuestions(topics, totalQuestions, difficulty) {
    try {
        let questions = [];
        const baseFilters = {};

        if (Array.isArray(topics) && topics.length > 0) {
            baseFilters.tags = topics;
        }

        if (difficulty === "Easy") {
            const easyQs = await fetchRandomQuestionsFromPool(totalQuestions, { ...baseFilters, difficulty: "EASY" });
            let needed = totalQuestions - easyQs.length;

            let mediumQs = [];
            if (needed > 0) {
                mediumQs = await fetchRandomQuestionsFromPool(needed, { ...baseFilters, difficulty: "MEDIUM" });
                needed -= mediumQs.length;
            }

            let hardQs = [];
            if (needed > 0) {
                hardQs = await fetchRandomQuestionsFromPool(needed, { ...baseFilters, difficulty: "HARD" });
            }
            questions = [...easyQs, ...mediumQs, ...hardQs];

        } else if (difficulty === "Hard") {
            const hardQs = await fetchRandomQuestionsFromPool(totalQuestions, { ...baseFilters, difficulty: "HARD" });
            let needed = totalQuestions - hardQs.length;

            let mediumQs = [];
            if (needed > 0) {
                mediumQs = await fetchRandomQuestionsFromPool(needed, { ...baseFilters, difficulty: "MEDIUM" });
                needed -= mediumQs.length;
            }

            let easyQs = [];
            if (needed > 0) {
                easyQs = await fetchRandomQuestionsFromPool(needed, { ...baseFilters, difficulty: "EASY" });
            }
            questions = [...hardQs, ...mediumQs, ...easyQs];

        } else if (difficulty === "Medium") {
            const mediumQs = await fetchRandomQuestionsFromPool(totalQuestions, { ...baseFilters, difficulty: "MEDIUM" });
            let needed = totalQuestions - mediumQs.length;
            
            let easyQs = [];
            if (needed > 0) {
                easyQs = await fetchRandomQuestionsFromPool(needed, { ...baseFilters, difficulty: "EASY" });
                needed -= easyQs.length;
            }
            
            let hardQs = [];
            if (needed > 0) {
                hardQs = await fetchRandomQuestionsFromPool(needed, { ...baseFilters, difficulty: "HARD" });
            }
            questions = [...mediumQs, ...easyQs, ...hardQs];

        } else if (difficulty === 'Medium/Hard') {
            const [mediumQs, hardQs] = await Promise.all([
                fetchRandomQuestionsFromPool(totalQuestions, { ...baseFilters, difficulty: "MEDIUM" }),
                fetchRandomQuestionsFromPool(totalQuestions, { ...baseFilters, difficulty: "HARD" })
            ]);
            let combined = [...mediumQs, ...hardQs].sort(() => 0.5 - Math.random());
            let medHardResult = combined.slice(0, totalQuestions);

            let needed = totalQuestions - medHardResult.length;
            let easyQs = [];
            if (needed > 0) {
                easyQs = await fetchRandomQuestionsFromPool(needed, { ...baseFilters, difficulty: "EASY" });
            }
            questions = [...medHardResult, ...easyQs];

        } else if (difficulty === "Progressive") {
            const [allEasy, allMedium, allHard] = await Promise.all([
                fetchRandomQuestionsFromPool(4000, { ...baseFilters, difficulty: "EASY" }),
                fetchRandomQuestionsFromPool(4000, { ...baseFilters, difficulty: "MEDIUM" }),
                fetchRandomQuestionsFromPool(4000, { ...baseFilters, difficulty: "HARD" })
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

                const fallbackQs = fallbackPool.slice(0, deficit);
                collectedQs.push(...fallbackQs);
            }

            const finalEasy = collectedQs.filter(q => q.difficulty === 'Easy');
            const finalMedium = collectedQs.filter(q => q.difficulty === 'Medium');
            const finalHard = collectedQs.filter(q => q.difficulty === 'Hard');

            questions = [...finalEasy, ...finalMedium, ...finalHard];
            
        }
        
        return questions.map(q => `https://leetcode.com/problems/${q.titleSlug}`);

    } catch (err) {
        console.error("An unexpected error occurred:", err);
        return [`An error occurred: ${err.message}`];
    }
}

export { makeLobbyID, generateQuestions };