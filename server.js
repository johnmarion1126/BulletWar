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

server.listen(process.env.PORT || 2000);

// eslint-disable-next-line no-console
console.log('Server started');

const {
  playerConnect,
  playerDisconnect,
  playerUpdate,
} = require('./server/Player');

const { bulletUpdate } = require('./server/Bullet');

const {
  PowerUp,
  powerUpUpdate,
} = require('./server/PowerUp');

const socketList = {};
const playerList = {};
const bulletList = {};
const powerUpList = {};

const initPack = { player: [], bullet: [], powerUp: [] };
const removePack = { player: [], bullet: [], powerUp: [] };

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
    const playerName = playerList[socket.id].name;
    for (const i in socketList) {
      socketList[i].emit('addToChat', playerName + ': ' + data);
    }
  });

  socket.on('restartGame', () => {
    for (const i in socketList) {
      socketList[i].emit('restart');
    }
  });

  socket.on('restartPositions', (data) => {
    for (const i in data) {
      const player = playerList[i];
      player.lives = 3;
      player.hp = 3;
      player.x = 250;
      player.y = 250;
      player.isInShadowRealm = false;
    }
  });

  socket.on('deleteBullets', (data) => {
    for (const i in data) {
      delete bulletList[i];
    }
  });
});

setInterval(() => {
  const powerUp = new PowerUp(initPack);
  powerUpList[powerUp.id] = powerUp;
}, 20000);

setInterval(() => {
  const pack = {
    player: playerUpdate(playerList, bulletList, initPack),
    bullet: bulletUpdate(bulletList, playerList, removePack),
    powerUp: powerUpUpdate(powerUpList, playerList, removePack),
  };

  for (const i in socketList) {
    const socket = socketList[i];
    socket.emit('init', initPack);
    socket.emit('update', pack);
    socket.emit('remove', removePack);
  }
  initPack.player = [];
  initPack.bullet = [];
  initPack.powerUp = [];
  removePack.player = [];
  removePack.bullet = [];
  removePack.powerUp = [];
}, 1000 / 25);
