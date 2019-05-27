const fs = require('fs');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.use('/', express.static('public'))


//var stream = fs.createWriteStream("public/Video.webm");

io.on('connection', function (socket) {
    //TODO : Add listener for images for stream.
    console.log(socket.id + ' has connected');
    
    socket.on('chatMsg', (chatBody) => {
        io.emit('chatMsg', chatBody);
    })
    socket.on('disconnect', () => {
        console.log(socket.id + ' Has Disconnected')
    })
    socket.on('frame', (videoFrame => {
        io.emit('frame', videoFrame);
        
    }))
    socket.on('stopStream', () => {
        stream.end();
        counter = 0;
    })
});

http.listen(port, function () {
    console.log('listening on *:' + port);
});