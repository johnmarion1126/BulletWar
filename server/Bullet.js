const Entity = require('./Entity');
const {
  TOP_LIMIT,
  BOTTOM_LIMIT,
  LEFT_LIMIT,
  RIGHT_LIMIT,
} = require('./Constants');

class Bullet extends Entity {
  constructor(parent, angle, initPack) {
    super();
    this.id = Math.random();
    this.spdX = Math.cos(angle / 180 * Math.PI) * 10;
    this.spdY = Math.sin(angle / 180 * Math.PI) * 10;
    this.parent = parent;
    this.toRemove = false;
    this.color = '#000000';
    this.bulletInitPackUpdate(initPack);
  }

  update(playerList) {
    this.updatePosition();

    for (const i in playerList) {
      const p = playerList[i];
      if (this.getDistance(p) < 10 && this.parent !== p.id) {
        p.hp -= 1;
        if (p.hp <= 0) {
          p.lives -= 1;
          if (p.lives <= 0) {
            p.isInShadowRealm = true;
            p.x = 700;
            p.y = 700;
          } else {
            p.hp = 3;
            p.x = 250;
            p.y = 250;
          }
        }
        this.toRemove = true;
      }
    }
  }

  updatePosition() {
    this.x += this.spdX;
    this.y += this.spdY;

    if (this.x < LEFT_LIMIT || this.x > RIGHT_LIMIT) {
      this.spdX = -this.spdX;
      this.parent = 0;
    }
    if (this.y < TOP_LIMIT || this.y > BOTTOM_LIMIT) {
      this.spdY = -this.spdY;
      this.parent = 0;
    }
  }

  getInitPack() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      color: this.color,
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
