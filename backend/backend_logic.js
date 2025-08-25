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
const getQuestionsQuery = `
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

const getLatestSubmissionQuery = `
query 
recentAcSubmissions($username: String!, $limit: Int!) {
    recentAcSubmissionList(username: $username, limit: $limit) {   
            titleSlug    
        }
    }`;


const headers = {
    "Content-Type": "application/json",
    "User-Agent": "PostmanRuntime/7.45.0",
    "Accept": "*/*",
    "Connection": "keep-alive",
    "Accept-Encoding": "identity"
}

async function getLatestSubmission(userName){
    const body = {
        query: getLatestSubmissionQuery,
        variables:{
            username: userName,
            limit: 3
        }
    }
    try{
        const res = await fetch(url, {method: 'POST', headers: headers, body: JSON.stringify(body)})
        const data = await res.json()
        const submittedQuestions = data.data.recentAcSubmissionList;
        const latestQuestions = [];
        for (const question of submittedQuestions){
            latestQuestions.push('https://leetcode.com/problems/' + question.titleSlug);
        }
        return latestQuestions;
    } catch(err){
        throw Error('Bad Username');
    }
};

export { makeLobbyID, getLatestSubmission };