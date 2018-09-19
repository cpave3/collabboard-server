const app  = require('express')();
const http = require('http').Server(app);
const io   = require('socket.io')(http);
const Log = require ('sleek-log')
    , log = new Log();

const crypto = require("crypto");

const generateId = (length = 3) => {
    return crypto.randomBytes(length).toString('hex');
}

const rooms = [];

const clients = [];

app.get('/', function(req, res){
  res.send('<h1>Hello world</h1>');
});

http.listen(3001, function(){
    log.info('Listening on *:3001');
});

io.on('connection', socket => {
    clients.push(socket);
    
    socket.on('REQUEST_ROOM', data => {
        socket.emit('ROOM_OFFER', {
            roomCode: generateId()
        });
    });

    socket.on('SEND_MESSAGE', data => {
        log.json(data);
        socket.broadcast.emit('RELEASE_MESSAGE', {
            message: data.message   
        });
    });

    socket.on('JOIN_ROOM', data => {
        log.json(data);
    });

    socket.on('disconnect', () => {
    });
});


