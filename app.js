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

const {
  playerConnect,
  playerDisconnect,
  playerUpdate,
} = require('./server/Player');

const { bulletUpdate } = require('./server/Bullet');

const socketList = {};
const playerList = {};
const bulletList = {};

const initPack = { player: [], bullet: [] };
const removePack = { player: [], bullet: [] };

io.sockets.on('connection', (socket) => {
  socket.id = Math.random();
  socketList[socket.id] = socket;

  socket.on('signIn', (data) => {
    playerConnect(socket, playerList, bulletList, initPack, data.username);
    socket.emit('signInResponse');
  });

  socket.on('disconnect', () => {
    delete socketList[socket.id];
    playerDisconnect(socket, playerList, removePack);
  });

  socket.on('sendMsgToServer', (data) => {
    let message;
    const playerName = playerList[socket.id].name;

    if (data === 'GAME OVER!') {
      message = 'Game Over! ' + playerName + ' won the battle, but not the war. Press "r" for the next battle.';
    } else {
      message = playerName + ': ' + data;
    }

    for (const i in socketList) {
      socketList[i].emit('addToChat', message);
    }
  });

  socket.on('restartPositions', (data) => {
    for (const i in data) {
      const player = playerList[i];
      player.x = Math.random() * 500;
      player.y = Math.random() * 500;
      player.isInShadowRealm = false;
    }
  });
});

setInterval(() => {
  const pack = {
    player: playerUpdate(playerList, bulletList, initPack),
    bullet: bulletUpdate(bulletList, playerList, removePack),
  };

  for (const i in socketList) {
    const socket = socketList[i];
    socket.emit('init', initPack);
    socket.emit('update', pack);
    socket.emit('remove', removePack);
  }
  initPack.player = [];
  initPack.bullet = [];
  removePack.player = [];
  removePack.bullet = [];
}, 1000 / 25);
