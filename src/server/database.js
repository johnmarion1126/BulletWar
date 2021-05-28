const mongojs = require('mongojs');

const db = mongojs('localhost:27017/myGame', ['account', 'progress']);

Database = {};
Database.isValidPassword = function (data, cb) {
  db.account.findOne(
    { username: data.username, password: data.password },
    (err, res) => {
      if (res) cb(true);
      else cb(false);
    },
  );
};

Database.isUsernameTaken = function (data, cb) {
  db.account.findOne({ username: data.username }, (err, res) => {
    if (res) cb(true);
    else cb(false);
  });
};

Database.addUser = function (data, cb) {
  db.account.insert(
    { username: data.username, password: data.password },
    (err) => {
      Database.savePlayerProgress(
        { username: data.username, items: [] },
        () => {
          cb();
        },
      );
    },
  );
};

Database.getPlayerProgress = function (username, cb) {
  db.progress.findOne({ username }, (err, res) => {
    cb({ items: res.items });
  });
};

Database.savePlayerProgress = function (data, cb) {
  cb = cb || function () {};
  db.progress.update({ username: data.username }, data, { upsert: true }, cb);
};
