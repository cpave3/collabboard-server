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

const currentConnections = {};

app.get('/', function(req, res){
  res.send('<h1>Hello world</h1>');
});

http.listen(3001, function(){
    log.info('Listening on *:3001');
});

io.on('connection', socket => {
    currentConnections[socket.id] = { socket, room: null, role: null };
    
    socket.on('REQUEST_ROOM', data => {
        // Generate a room ID
        const roomCode = generateId();
        // Add the Host to this room
        currentConnections[socket.id].room = roomCode;
        currentConnections[socket.id].role = 'host';
        socket.join(roomCode);
        // Send the ID back to the host
        socket.emit('ROOM_OFFER', {
            roomCode
        });
    });

    socket.on('SEND_MESSAGE', data => {
        log.json(data);
        socket.broadcast.to(getRoom(socket)).emit('RELEASE_MESSAGE', {
            message: data.message   
        });
    });

    socket.on('JOIN_ROOM', data => {
        socket.join(data.roomCode);
        currentConnections[socket.id].room = data.roomCode;
        currentConnections[socket.id].role = 'particiapnt';
        currentConnections[socket.id].username = data.username;
        socket.broadcast.to(data.roomCode).emit('PLAYER_JOINED', {
            username: data.username,
            role: 'participant'
        });
        log.json(data);
    });

    socket.on('disconnect', () => {
        delete currentConnections[socket.id];
    });
});

const getRoom = socket => {
    return currentConnections[socket.id].room || socket.id;
}


