import { io } from './server/server';

require('./server/server');

const ctx = document.getElementById('ctx').getContext('2d');
ctx.font = '30px Arial';
const socket = io();

socket.on('newPositions', (data) => {
  ctx.clearRect(0, 0, 500, 500);
  for (let i = 0; i < data.length; i += 1)
    ctx.fillText(data[i].number, data[i].x, data[i].y);
});

/* TODO
FIX CONFLICTS WITH WEBPACK
*/
