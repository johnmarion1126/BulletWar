const Entity = require('./Entity');

// eslint-disable-next-line no-unused-vars
module.exports = class Player extends Entity {
  constructor(id) {
    super();
    this.id = id;
    this.number = '' + Math.floor(10 * Math.random());
    this.pressingRight = false;
    this.pressingLeft = false;
    this.pressingUp = false;
    this.pressingDown = false;
    this.maxSpd = 10;
  }

  update() {
    this.updateSpd();
    this.updatePosition();
  }

  updateSpd() {
    if (this.pressingRight) {
      this.spdX = this.maxSpd;
    } else if (this.pressingLeft) {
      this.spdX = -this.maxSpd;
    } else {
      this.spdX = 0;
    }
  }
};

/*
Player.onConnect = (socket) => {
  const player = new Player(socket.id);
  socket.on('keyPress', (data) => {
    if (data.inputId === 'left') {
      player.pressingLeft = data.state;
    } else if (data.inputId === 'right') {
      player.pressingRight = data.state;
    } else if (data.inputId === 'up') {
      player.pressingUp = data.state;
    } else if (data.inputId === 'down') {
      player.pressingDown = data.state;
    }
  });
};

Player.onDisconnect = (socket) => {

}

Player.update = () {
}
*/
