const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const Log = require("sleek-log"),
  log = new Log();

const crypto = require("crypto");

const Types = require("./constants/actionTypes");

const generateId = (length = 3) => {
  return crypto.randomBytes(length).toString("hex");
};

const rooms = {};

const currentConnections = {};

const PORT = process.env.PORT || 3001;

app.get("/", function(req, res) {
  res.send(`<h1>Running on ${PORT}</h1>`);
});

http.listen(PORT, function() {
  log.info(`Listening on *:${PORT}`);
});

const startInterval = socket => {
  return setInterval(() => {
    socket.emit(Types.PING, { ping: "stay alive" });
    log.info(`PINGING: ${socket.id}`);
  }, 60000);
};

io.on("connect", socket => {
  currentConnections[socket.id] = {
    socket,
    room: null,
    role: null,
    interval: startInterval(socket)
  };
  log.success(socket.id);

  // The client has requested to join or make a room
  socket.on(Types.JOIN_ROOM, data => {
    // The payload should contain the roomCode
    const roomCode = data.roomCode;

    log.info(`${socket.id} joined ${roomCode}`);

    // Determine if this exists
    if (!rooms[roomCode]) {
      rooms[roomCode] = {
        owner: socket.id,
        users: [],
        canvas: []
      };
    } else {
      // TODO: Handle room auth here
    }

    // Join this room
    rooms[roomCode].users.push(socket.id);
    currentConnections[socket.id] = {
      roomCode
    };
    socket.join(roomCode);

    // Send the room back to the user
    socket.emit(Types.ENTER_ROOM, {
      ...rooms[roomCode]
    });

    io.in(roomCode).emit(Types.USER_SYNC, {
      users: rooms[roomCode].users
    });

    socket.emit(Types.CANVAS_SYNC, rooms[roomCode].canvas);
  });

  // A client has sent their canvas diff
  socket.on(Types.CANVAS_UPDATE, data => {
    const { roomCode } = currentConnections[socket.id];
    if (roomCode) {
      log.json({
        socket: socket.id,
        dataSize: data.objects.length
      });

      // Push the diff into the shared canvas
      rooms[roomCode].canvas = data.objects;

      // Push out the new canvas state
      socket.broadcast
        .to(roomCode)
        .emit(Types.CANVAS_SYNC, rooms[roomCode].canvas);
    } else {
      log.danger("null room user sent update");
    }
  });

  socket.on("disconnect", () => {
      // stop the interval
      clearInterval(currentConnections[socket.id].interval);
      delete currentConnections[socket.id]

    // const roomCode = getValue(socket, 'room');
    // // Remove this player from the room occupants list
    // if (roomCode && rooms[roomCode].players.length) {
    //     rooms[roomCode].players = rooms[roomCode].players.filter(id => id !== socket.id);
    // }
    // io.in(roomCode).emit('PLAYER_LEFT', {
    //     id: socket.id
    // });
    // delete currentConnections[socket.id];
  });
});
