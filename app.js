const express = require('express');
const app = express();
const server = require('http').Server(app);
const path = require('path');

// eslint-disable-next-line no-path-concat
app.use(express.static(path.join(__dirname, '/client')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/client/index.html'));
});

server.listen(2000);

// eslint-disable-next-line no-console
console.log('Server started');

const socketList = [];

const io = require('socket.io')(server, {});
io.sockets.on('connection', (socket) => {
  console.log('Connection Made');
  socket.io = Math.random();
  socket.x = 0;
  socket.y = 0;
  socket.number = `${Math.floor(10 * Math.random())}`;
  socketList[socket.id] = socket;

  socket.on('disconnect', () => {
    delete socketList[socket.id];
  });
});

setInterval(() => {
  const pack = [];
  socketList.forEach((i) => {
    const socket = socketList[i];
    socket.x += 1;
    socket.y += 1;
    pack.push({
      x: socket.x,
      y: socket.y,
      number: socket.number,
    });
  });

  socketList.forEach((i) => {
    console.log('emit new position');
    const socket = socketList[i];
    socket.emit('newPositions', pack);
  });
}, 1000 / 25);
