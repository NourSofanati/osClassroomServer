chatForm.onsubmit = (e) => {
    e.preventDefault();
    if (chatMsg.value.trim()) {
        sendSocket({
            user: user,
            msg: chatMsg.value.toString()
        });
        chatForm.reset();
    } else {
        alert('يتوجب عليك ارسال رسالة صحيحة');
    }
}

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
    `;
    chatMsgs.scrollTo(0, chatMsgs.scrollHeight);
}

function sendSocket(data) {
    let msgOb = new MsgObject(data.user, data.msg);
    socket.emit('chatMsg', msgOb);
}