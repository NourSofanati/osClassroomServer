var options = {
    rememberUpgrade: true,
    transports: ['websocket'],
    secure: true,
    rejectUnauthorized: false
}
var socket = io.connect('localhost:3000', options);
let chatForm = document.querySelector('form');
let chatMsg = document.querySelector('#chatMsg');
let chatMsgs = document.querySelector('#chatMsgs');
let user = 'nour_94017';

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendSocket({
        user: user,
        msg: chatMsg.value
    })
    chatForm.reset();
})

socket.on('chatMsg', data => {
    renderMessage(data);
})

function renderMessage(data) {
    chatMsgs.innerHTML += `
    <div class="msg">
        <h4>${data.user}</h4>
        <p>${data.msg}</p>
        <small>${new Date(data.date).toLocaleTimeString()}</small>
    </div>
    `
}

function sendSocket(data) {
    let msgOb = new MsgObject(data.user, data.msg);
    socket.emit('chatMsg', msgOb);
}