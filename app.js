const express = require('express');
const app = express();
const server = require('http').Server(app);
const path = require('path');
const io = require('socket.io')(server, {});

// eslint-disable-next-line no-path-concat
app.use(express.static(path.join(__dirname, '/client')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/client/index.html'));
});

server.listen(2000);

// eslint-disable-next-line no-console
console.log('Server started');

const { Socket } = require('dgram');
const {
  Player,
  playerConnect,
  playerDisconnect,
  playerUpdate,
} = require('./server/Player');

const {
  Bullet,
  bulletUpdate,
} = require('./server/Bullet');

const socketList = {};
const playerList = {};
const bulletList = {};

io.sockets.on('connection', (socket) => {
  socket.id = Math.random();
  socketList[socket.id] = socket;

  playerConnect(socket, playerList);

  socket.on('disconnect', () => {
    delete socketList[socket.id];
    playerDisconnect(socket, playerList);
  });

  socket.on('sendMsgToServer', (data) => {
    const playerName = ('' + socket.id).slice(2, 7);
    for (const i in socketList) {
      socketList[i].emit('addToChat', playerName + ': ' + data);
    }
  });
});

setInterval(() => {
  const pack = {
    player: playerUpdate(playerList),
    bullet: bulletUpdate(bulletList),
  };

  for (const i in socketList) {
    socketList[i].emit('newPositions', pack);
  }
}, 1000 / 25);
