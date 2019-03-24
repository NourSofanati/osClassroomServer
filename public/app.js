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
        },
        audio:{}
    };
    // above constraints are NOT supported YET
    // that's why overridnig them
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

var recorder; // globally accessible

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

    recorder.screen.stop();
    recorder.destroy();
    recorder = null;
    StartRecordingBTN.disabled = false;
}

StartRecordingBTN.onclick = function () {
    this.disabled = true;
    captureScreen(function (screen) {
        video.srcObject = screen;
        recorder = RecordRTC(screen, {
            type: 'video',
            bitsPerSecond: 256 * 8 * 256,
            timeSlice: 500,
            preview() {
                console.log('hey');
                video.src = this.getArrayOfBlobs();
            }
        });
        recorder.startRecording();
        // release screen on stopRecording
        recorder.screen = screen;
        StopRecordingBTN.disabled = false;
    });
};

StopRecordingBTN.onclick = function () {
    this.disabled = true;
    recorder.stopRecording(stopRecordingCallback);
};

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