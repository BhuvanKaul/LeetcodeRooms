const makeRoomButton = document.querySelector('.makeRoomButton');
const joinRoomButton = document.querySelector('.joinRoomButton');

makeRoomButton.addEventListener("click", async () => {
    console.log('MAKE ROOM CLICKED');
    let userId = localStorage.getItem('userId');
    if (!userId){
        userId = crypto.randomUUID();
        localStorage.setItem('userId', userId);
    }

    try{
        const response = await fetch('/lobbies', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: userId
            })
        })

        if (!response.ok){
            throw new Error(`BAD HTTP STATUS: ${response.status}`);
        }
        const data = await response.json();
        const createdLobbyId = data.lobbyId;

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
        let userId = localStorage.getItem('userId');
        if (!userId){
            userId = crypto.randomUUID();
            localStorage.setItem('userId', userId);
        }

        try{
            const response = await fetch(`/lobbies/${lobbyId}/join`, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: userId
                })
            })

            if(!response.ok){
                throw new Error(`BAD HTTP RESPONSE ON TRYING TO ADD USER: ${response}`);
            }
            window.location.href = `/lobbies/${lobbyId}`;
        } catch(err){
            console.log("Error Joining Lobby:", err)
        }
    })

})
