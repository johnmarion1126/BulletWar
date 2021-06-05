const Entity = require('./Entity');

// eslint-disable-next-line no-unused-vars
class Bullet extends Entity {
  constructor(angle) {
    super();
    this.id = Math.random();
    this.spdX = Math.cos(angle / 180 * Math.PI) * 10;
    this.spdY = Math.sin(angle / 180 * Math.PI) * 10;

    this.timer = 0;
    this.toRemove = false;
  }

  update() {
    this.time += 1;
    if (this.timer > 100) {
      this.toRemove = true;
    }
    this.updatePosition();
  }
}

/*
Bullet.update = () {

}
*/
