const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');

const app = express();
const server = require('http').Server(app);

const config = require('./webpack.config.js');
const compiler = webpack(config);

app.use(
  webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath,
  })
);

app.listen(3000, () => {
  console.log('Example app listening on port 3000!\n');
});

app.get('/', (req, res) => {
    res.sendFile('dist/index.html', { root: __dirname })
});