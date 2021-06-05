const express = require('express');
const app = express();
const server = require('http').Server(app);
const path = require('path');

const io = require('socket.io')(server, {});
const Player = require('./server/Player');
const Bullet = require('./server/Bullet');

// eslint-disable-next-line no-path-concat
app.use(express.static(path.join(__dirname, '/client')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/client/index.html'));
});

server.listen(2000);

// eslint-disable-next-line no-console
console.log('Server started');

const socketList = [];

io.sockets.on('connection', (socket) => {
  socket.id = Math.random();
  socketList.push(socket);

  socket.on('disconnect', () => {
    delete socketList[socket.id];
  });
});

setInterval(() => {
  const pack = [];
  socketList.forEach((i) => {
    const socket = i;
    socket.x += 1;
    socket.y += 1;
    pack.push({
      x: socket.x,
      y: socket.y,
      number: socket.number,
    });
  });

  socketList.forEach((i) => {
    const socket = i;
    socket.emit('newPositions', pack);
  });
}, 1000 / 25);

const playerList = [];
const bulletList = [];
