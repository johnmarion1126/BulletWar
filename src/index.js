require('./Database');
require('./Entity');
require('./client/Inventory');

const express = require('express');

const app = express();
const serv = require('http').Server(app);

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/client/index.html`);
});
app.use('/client', express.static(`${__dirname}/client`));

serv.listen(2000);
console.log('Server started.');

const SOCKET_LIST = {};
const DEBUG = true;

const io = require('socket.io')(serv, {});

io.sockets.on('connection', (socket) => {
  socket.id = Math.random();
  SOCKET_LIST[socket.id] = socket;

  socket.on('signIn', (data) => {
    Database.isValidPassword(data, (res) => {
      if (res) {
        Player.onConnect(socket, data.username);
        socket.emit('signInResponse', { success: true });
      } else {
        socket.emit('signInResponse', { success: false });
      }
    });
  });

  socket.on('signUp', (data) => {
    Database.isUsernameTaken(data, (res) => {
      if (!res) return socket.emit('signInResponse', { success: false });
      Database.getPlayerProgress(data.username, (progress) => {
        Player.onConnect(socket, data.username, progress);
        socket.emit('signInResponse', { success: true });
      });
    });
  });

  socket.on('disconnect', () => {
    delete SOCKET_LIST[socket.id];
    Player.onDisconnect(socket);
  });

  socket.on('evalServer', (data) => {
    if (!DEBUG) return;
    const res = eval(data);
    socket.emit('evalAnswer', res);
  });
});

setInterval(() => {
  const packs = Entity.getFrameUpdateData();
  for (const i in SOCKET_LIST) {
    const socket = SOCKET_LIST[i];
    socket.emit('init', packs.initPack);
    socket.emit('update', packs.updatePack);
    socket.emit('remove', packs.removePack);
  }
}, 1000 / 25);
