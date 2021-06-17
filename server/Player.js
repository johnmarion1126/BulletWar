const Entity = require('./Entity');
const { Bullet, getAllBulletInitPack } = require('./Bullet');
const { WIDTH, HEIGHT } = require('./Constants');

const getAllPlayerInitPack = (playerList) => {
  const players = [];
  for (const i in playerList) {
    players.push(playerList[i].getInitPack());
  }
  return players;
};

class Player extends Entity {
  constructor(id, initPack, name) {
    super();
    this.id = id;
    this.number = '' + Math.floor(10 * Math.random());
    this.pressingRight = false;
    this.pressingLeft = false;
    this.pressingUp = false;
    this.pressingDown = false;

    this.mouseAngle = 0;
    this.maxSpd = 10;
    this.hp = 10;
    this.hpMax = 10;
    this.score = 0;
    this.name = name;
    this.playerInitPackUpdate(initPack);
  }

  update(bulletList, initPack) {
    this.updateSpd();
    this.updatePosition();

    if (this.pressingAttack) {
      this.shootBullet(this.mouseAngle, bulletList, initPack);
    }
  }

  updatePosition() {
    this.x += this.spdX;
    this.y += this.spdY;

    if (this.x < 0 || this.x > WIDTH) {
      this.spdX = 0;
    }
    if (this.y < 0 || this.y > HEIGHT) {
      this.spdY = 0;
    }
  }

  shootBullet(angle, bulletList, initPack) {
    const b = new Bullet(this.id, angle, initPack);
    bulletList[b.id] = b;
    b.x = this.x;
    b.y = this.y;
  }

  updateSpd() {
    if (this.pressingRight) {
      this.spdX = this.maxSpd;
    } else if (this.pressingLeft) {
      this.spdX = -this.maxSpd;
    } else {
      this.spdX = 0;
    }

    if (this.pressingUp) {
      this.spdY = -this.maxSpd;
    } else if (this.pressingDown) {
      this.spdY = this.maxSpd;
    } else {
      this.spdY = 0;
    }
  }

  getInitPack() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      number: this.number,
      hp: this.hp,
      hpMax: this.hpMax,
      score: this.score,
    };
  }

  getUpdatePack() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      hp: this.hp,
      score: this.score,
    };
  }

  playerInitPackUpdate(initPack) {
    initPack.player.push(this.getInitPack());
  }
}

const playerConnect = (socket, playerList, bulletList, initPack, name) => {
  const player = new Player(socket.id, initPack, name);
  playerList[socket.id] = player;

  socket.on('keyPress', (data) => {
    if (data.inputId === 'left') {
      player.pressingLeft = data.state;
    } else if (data.inputId === 'right') {
      player.pressingRight = data.state;
    } else if (data.inputId === 'up') {
      player.pressingUp = data.state;
    } else if (data.inputId === 'down') {
      player.pressingDown = data.state;
    } else if (data.inputId === 'attack') {
      player.pressingAttack = data.state;
    } else if (data.inputId === 'mouseAngle') {
      player.mouseAngle = data.state;
    }
  });

  socket.emit('init', {
    player: getAllPlayerInitPack(playerList),
    bullet: getAllBulletInitPack(bulletList),
  });
};

const playerDisconnect = (socket, playerList, removePack) => {
  delete playerList[socket.id];
  removePack.player.push(socket.id);
};

const playerUpdate = (playerList, bulletList, initPack) => {
  const pack = [];
  for (const i in playerList) {
    const player = playerList[i];
    player.update(bulletList, initPack);
    pack.push(player.getUpdatePack());
  }
  return pack;
};

module.exports = {
  playerConnect,
  playerDisconnect,
  playerUpdate,
};
