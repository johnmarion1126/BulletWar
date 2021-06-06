module.exports = class Entity {
  constructor() {
    this.x = 150;
    this.y = 75;
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
