document.addEventListener('DOMContentLoaded',()=>{
    const message = document.querySelector('.lobbyMsg');

    function getID(url){
        const segments = url.pathname.split('/').filter(Boolean);
        return segments[1] || null;
    };

    const lobbyId = getID(new URL(window.location.href));
    const userId = localStorage.getItem('userId');
    message.textContent = `YOU ARE IN LOBBY ${lobbyId}`;
    
    const sendBtn = document.querySelector('#sendMessageBtn');
    const messageInput = document.querySelector('#messageInput');
    const allMessages = document.querySelector('#messages')

    const socket = io();
    socket.emit('joinLobby', {lobbyId, userId});

    socket.on('userJoined', ({userId}) =>{
        const newMsg = document.createElement('p');
        newMsg.textContent = `${userId} joined the lobby`;
        allMessages.appendChild(newMsg); 
        console.log(`${userId} JOined`)
    }); 

    socket.on('chatMsg', ({userId, message})=>{
        const newMsg = document.createElement('p');
        newMsg.textContent = `${userId}: ${message}`;
        allMessages.appendChild(newMsg);
    });

    sendBtn.addEventListener('click', ()=>{
        const message = messageInput.value;
        socket.emit('chatMsg', {lobbyId, userId, message});
    });

});

