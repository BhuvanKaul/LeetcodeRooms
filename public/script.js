const makeRoomButton = document.querySelector('.makeRoomButton');
const joinRoomButton = document.querySelector('.joinRoomButton');

makeRoomButton.addEventListener("click", async () => {
    console.log('MAKE ROOM CLICKED');

    try{
        const response = await fetch('/lobbies', {
        method: 'post'
        })

        if (!response.ok){
            throw new Error(`BAD HTTP STATUS: ${response.status}`);
        }
        const data = await response.json();
        const createdLobbyId = data.id;

        window.location.href = `/lobbies/${createdLobbyId}`;
    
    }catch(err){
        console.log(err);
    }
})

joinRoomButton.addEventListener('click', () => {
    console.log("make room clicked");
    const joinLobbyWindow = document.querySelector(".joinRoomPopUp");
    joinLobbyWindow.style.display = 'block';

    const closeBtn = document.querySelector('.closeBtn');
    closeBtn.addEventListener('click', ()=>{
        joinLobbyWindow.style.display = 'none';
    })

    const inputField = document.querySelector('#lobbyIdInput');
    const joinBtn = document.querySelector('.joinBtn');

    joinBtn.addEventListener('click', async ()=>{
        const lobbyId = inputField.value;
        window.location.href = `/lobbies/${lobbyId}`;
    })

})
