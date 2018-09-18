const app  = require('express')();
const http = require('http').Server(app);
const io   = require('socket.io')(http);
const Log = require ('sleek-log')
    , log = new Log();

const crypto = require("crypto");

const generateId = (length = 3) => {
    return crypto.randomBytes(length).toString('hex');
}

app.get('/', function(req, res){
  res.send('<h1>Hello world</h1>');
});

http.listen(3001, function(){
    log.info('Listening on *:3001');
});

io.on('connection', socket => {
    log.success('A Client has connected');
    log.json(socket.connected);
    socket.emit('ROOM_OFFER', {
        roomCode: generateId()
    });
    socket.on('disconnect', () => {
        log.danger('User has disconnected');
    });
});


