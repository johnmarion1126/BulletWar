// eslint-disable-next-line no-unused-vars
module.exports = class Entity {
  constructor() {
    this.x = 250;
    this.y = 250;
    this.spdX = 0;
    this.id = '';
    return this;
  }

  update() {
    this.updatePosition();
  }

  updatePosition() {
    this.x += this.spdX;
    this.y += this.spdY;
  }
};
