const makeRoomButton = document.querySelector('.makeRoomButton');
const joinRoomButton = document.querySelector('.joinRoomButton');

makeRoomButton.addEventListener("click", async () => {
    console.log('MAKE ROOM CLICKED');

    try{
        response = await fetch('/lobby', {
        method: 'post'
    })

    if (!response.ok){
        throw new Error(`BAD HTTP STATUS: ${response.status}`);
    }
    data = await response.json();
    console.log(`ID: ${data.id}`)
    }catch(err){
        console.log(err);
    }
})

joinRoomButton.addEventListener('click', () => {
    console.log("JOIN ROOM CLICKED");
})

