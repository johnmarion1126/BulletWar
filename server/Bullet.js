const Entity = require('./Entity');

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

const bulletUpdate = (bulletList) => {
  if (Math.random() < 0.5) {
    const randBullet = new Bullet(Math.random() * 360);
    bulletList[randBullet.id] = randBullet;
  }

  const pack = [];
  for (const i in bulletList) {
    const bullet = bulletList[i];
    bullet.update();
    pack.push({
      x: bullet.x,
      y: bullet.y,
    });
  }
  return pack;
};

module.exports = {
  Bullet,
  bulletUpdate,
};
