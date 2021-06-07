const Entity = require('./Entity');

class Bullet extends Entity {
  constructor(parent, angle, initPack) {
    super();
    this.id = Math.random();
    this.spdX = Math.cos(angle / 180 * Math.PI) * 10;
    this.spdY = Math.sin(angle / 180 * Math.PI) * 10;
    this.parent = parent;
    this.timer = 0;
    this.toRemove = false;
    this.bulletInitPackUpdate(initPack);
  }

  update(playerList) {
    this.time += 1;
    if (this.timer > 100) {
      this.toRemove = true;
    }
    this.updatePosition();

    for (const i in playerList) {
      const p = playerList[i];
      if (this.getDistance(p) < 32 && this.parent !== p.id) {
        p.hp -= 1;

        if (p.hp <= 0) {
          const shooter = playerList[this.parent];
          if (shooter) shooter.score += 1;
          p.hp = p.hpMax;
          p.x = Math.random() * 500;
          p.y = Math.random() * 500;
        }
        this.toRemove = true;
      }
    }
  }

  getInitPack() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
    };
  }

  getUpdatePack() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
    };
  }

  bulletInitPackUpdate(initPack) {
    initPack.bullet.push(this.getInitPack());
  }
}

const bulletUpdate = (bulletList, playerList, removePack) => {
  const pack = [];
  for (const i in bulletList) {
    const bullet = bulletList[i];
    bullet.update(playerList);

    if (bullet.toRemove) {
      delete bulletList[i];
      removePack.bullet.push(bullet.id);
    } else {
      pack.push(bullet.getUpdatePack());
    }
  }
  return pack;
};

const getAllBulletInitPack = (bulletList) => {
  const bullets = [];
  for (const i in bulletList) {
    bullets.push(bulletList[i].getInitPack());
  }
  return bullets;
};

module.exports = {
  Bullet,
  bulletUpdate,
  getAllBulletInitPack,
};
