var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.use('/', express.static('public'))


io.on('connection', function (socket) {
    console.log(socket.id+'has connected');
    socket.on('chatMsg', (chatBody) => {
        io.emit('chatMsg', chatBody);
    })
});

http.listen(port, function () {
    console.log('listening on *:' + port);
});