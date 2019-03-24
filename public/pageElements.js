const video = document.getElementById("video");
const chatForm = document.querySelector('form');
const chatMsg = document.querySelector('#chatMsg');
const chatMsgs = document.querySelector('#chatMsgs');

//WebChat.
const user = 'Nour'; //prompt('Please enter your username');
const options = {
    rememberUpgrade: true,
    transports: ['websocket'],
    secure: true,
    rejectUnauthorized: false
}
const socket = io.connect('localhost:3000', options);