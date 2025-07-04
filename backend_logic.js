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

export { makeLobbyID };