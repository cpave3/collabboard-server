module.exports = {
  JOIN_ROOM: "LOBBY/JOIN_ROOM", // A client wishes to join or create a room
  REQUEST_AUTH: "LOBBY/REQUEST_AUTH", // The room exists and requires authentication
  ATTEMPT_AUTH: "LOBBY/ATTEMPT_AUTH", // The client has submitted creds
  ACCEPT_AUTH: "LOBBY/ACCEPT_AUTH", // The creds are valid
  REJECT_AUTH: "LOBBY/REJECT_AUTH", // The creds are invalid

  ENTER_ROOM: "ROOM/ENTER_ROOM",
  USER_SYNC: "ROOM/USER_SYNC",
  SEND_DIFF: "ROOM/CANVAS/DIFF", // A user has change their canvas and sent the diff for propagation
  CANVAS_UPDATE: "ROOM/CANVAS/UPDATE", // The server will release the changes to any listening clients
  CANVAS_SYNC: "ROOM/CANVAS/SYNC",
};
