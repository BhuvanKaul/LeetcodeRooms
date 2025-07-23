document.addEventListener('DOMContentLoaded',()=>{
    const message = document.querySelector('.lobbyMsg');
    function getID(url){
        const segments = url.pathname.split('/').filter(Boolean);
        return segments[1] || null;
    };
    const lobbyId = getID(new URL(window.location.href));
    message.textContent = `YOU ARE IN LOBBY ${lobbyId}`;
    console.log(`YOU ARE IN LOBBY ${lobbyId}`);
});

