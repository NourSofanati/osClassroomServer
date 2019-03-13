const video = document.getElementById("video");
const chatForm = document.querySelector('form');
const chatMsg = document.querySelector('#chatMsg');
const chatMsgs = document.querySelector('#chatMsgs');

const user = 'Nour'; //prompt('Please enter your username');
var options = {
    rememberUpgrade: true,
    transports: ['websocket'],
    secure: true,
    rejectUnauthorized: false
}
var socket = io.connect('localhost:3000', options);


if (!navigator.getDisplayMedia && !navigator.mediaDevices.getDisplayMedia) {
    var error = 'Your browser does NOT support the getDisplayMedia API.';
    document.querySelector('h1').innerHTML = error;
    document.querySelector('video').style.display = 'none';
    document.getElementById('btn-start-recording').style.display = 'none';
    document.getElementById('StopRecording').style.display = 'none';
    throw new Error(error);
}

function invokeGetDisplayMedia(success, error) {
    var displaymediastreamconstraints = {
        video: {
            displaySurface: 'monitor', // monitor, window, application, browser
            logicalSurface: true,
            cursor: 'always' // never, always, motion
        }
    };
    // above constraints are NOT supported YET
    // that's why overridnig them
    displaymediastreamconstraints = {
        video: true
    };
    if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia(displaymediastreamconstraints).then(success).catch(error);
    } else {
        navigator.getDisplayMedia(displaymediastreamconstraints).then(success).catch(error);
    }
}


var recorder; // globally accessible

function captureScreen(callback) {
    invokeGetDisplayMedia(function (screen) {
        addStreamStopListener(screen, function () {
            document.getElementById('StopRecording').click();
        });
        callback(screen);
    }, function (error) {
        console.error(error);
        alert('Unable to capture your screen. Please check console logs.\n' + error);
    });
}

function stopRecordingCallback() {
    video.src = video.srcObject = null;
    video.src = URL.createObjectURL(recorder.getBlob());

    recorder.screen.stop();
    recorder.destroy();
    recorder = null;
    document.getElementById('btn-start-recording').disabled = false;
}


chatForm.addEventListener('submit', (e) => {
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
})

document.getElementById('StartRecording').onclick = function () {
    this.disabled = true;
    captureScreen(function (screen) {
        video.srcObject = screen;
        recorder = RecordRTC(screen, {
            type: 'video'
        });
        recorder.startRecording();
        // release screen on stopRecording
        recorder.screen = screen;
        document.getElementById('StopRecording').disabled = false;
    });
};

document.getElementById('StopRecording').onclick = function () {
    this.disabled = true;
    recorder.stopRecording(stopRecordingCallback);
};


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


function addStreamStopListener(stream, callback) {
    stream.addEventListener('ended', function () {
        callback();
        callback = function () {};
    }, false);
    stream.addEventListener('inactive', function () {
        callback();
        callback = function () {};
    }, false);
    stream.getTracks().forEach(function (track) {
        track.addEventListener('ended', function () {
            callback();
            callback = function () {};
        }, false);
        track.addEventListener('inactive', function () {
            callback();
            callback = function () {};
        }, false);
    });
}