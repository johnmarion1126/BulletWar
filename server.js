import {
  io, app,
} from './src/io';

const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const config = require('./webpack.config');

const compiler = webpack(config);

app.use(
  webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath,
  }),
);

app.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log('Example app listening on port 3000!\n');
});

app.get('/', (req, res) => {
  res.sendFile('dist/index.html', { root: __dirname });
});

const socketList = [];

io.sockets.on('connection', (socket) => {
  socket.id = Math.random();
  socket.x = 0;
  socket.y = 0;
  socket.number = ` ${Math.floor(10 * Math.random())}`;
  socketList[socket.id] = socket;
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
    const socket = socketList[i];
    socket.emit('newPositions', pack);
  });
}, 1000 / 25);

/*
TODO:
Add dependencies to fix polyfills and path errors
*/
