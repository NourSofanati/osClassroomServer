let stopped = false;

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
            displaySurface: 'monitor',
            logicalSurface: true,
            cursor: 'always'
        },
        audio: {}
    };
    displaymediastreamconstraints = {
        video: true,
        audio: true
    };
    if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia(displaymediastreamconstraints).then(success).catch(error);
    } else {
        navigator.getDisplayMedia(displaymediastreamconstraints).then(success).catch(error);
    }
}

var recorder; // globally accessible.
var audio_recorder; // globally accessible.

function captureScreen(callback) {
    invokeGetDisplayMedia(function (screen) {
        addStreamStopListener(screen, function () {
            StopRecordingBTN.click();
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
    stopped = true;
    recorder.screen.stop();
    recorder.destroy();
    recorder = null;
    StartRecordingBTN.disabled = false;
}
StartRecordingBTN.onclick = function () {
    this.disabled = true;
    captureScreen(function (screen) {
        video.srcObject = screen;
        video.play();
        console.log(screen);
        recorder = RecordRTC(screen, {
            type: 'video',
            mimeType: 'video/webm;codecs=vp9',
        });
        recorder.startRecording();
        recorder.screen = screen;
        StopRecordingBTN.disabled = false;
    });
};

StopRecordingBTN.onclick = function () {
    this.disabled = true;
    recorder.stopRecording(stopRecordingCallback);
    recorder.destroy();
};

function addStreamStopListener(stream, callback) {
    stream.addEventListener('ended', function () {
        callback();
        callback = function () {};
        socket.emit('stopStream');
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


var canvas = document.getElementById('canvas'); //document.createElement('canvas');
canvas.height = stream.height = 1080;
canvas.width = stream.width = 1920;
var context = canvas.getContext('2d');
video.addEventListener('play', function () {
    sendDrawData(this);
}, false);

function sendDrawData(video) {
    context.drawImage(video,
        0, 0,
        1920, 1080,
        0, 0,
        1280, 720);
    let frame = canvas.toDataURL();
    socket.emit('frame', frame);
    if (!stopped) window.setTimeout(sendDrawData,66, video);
}
var img = new Image(1280, 720);
var streamContext = stream.getContext('2d');

function recieveDrawData(frame) {
    img.src = frame;
    streamContext.drawImage(img,
        0, 0,
        1280, 720,
        0, 0,
        1280, 720);
}