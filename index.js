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
        socket.broadcast.to(getValue(socket, 'room')).emit('RELEASE_MESSAGE', {
            message: data.message   
        });
    });

    socket.on('JOIN_ROOM', data => {
        socket.join(data.roomCode);
        setValue(socket, 'room', data.roomCode);
        setValue(socket, 'role', 'participant');
        setValue(socket, 'username', data.username);
        socket.broadcast.to(data.roomCode).emit('PLAYER_JOINED', {
            id: socket.id,
            username: data.username,
            role: 'participant'
        });
        log.json(data);
    });

    socket.on('disconnect', () => {
        io.in(getValue(socket, 'room')).emit('PLAYER_LEFT', {
            id: socket.id
        });
        delete currentConnections[socket.id];
    });
});

const getValue = (socket, key) => {
    return currentConnections[socket.id][key] || null;
}

const setValue = (socket, key, value) => {
    currentConnections[socket.id][key] = value;
}

