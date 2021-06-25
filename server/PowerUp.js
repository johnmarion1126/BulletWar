const Entity = require('./Entity');
const { WIDTH, HEIGHT } = require('./Constants');

class PowerUp extends Entity {
  constructor(initPack) {
    super();
    this.id = Math.random();
    this.x = Math.random() * WIDTH;
    this.y = Math.random() * HEIGHT;
    this.color = '#9ec23a';
    this.toRemove = false;
    this.powerUpInitPackUpdate(initPack);
  }

  update(playerList) {
    for (const i in playerList) {
      const p = playerList[i];
      if (this.getDistance(p) < 15) {
        p.powerUp = true;
        this.toRemove = true;
        setTimeout(() => {
          p.powerUp = false;
        }, 5000);
      }
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

  powerUpInitPackUpdate(initPack) {
    initPack.powerUp.push(this.getInitPack());
  }
}

const powerUpUpdate = (powerUpList, playerList, removePack) => {
  for (const i in powerUpList) {
    const pickUp = powerUpList[i];
    pickUp.update(playerList);

    if (pickUp.toRemove) {
      delete powerUpList[i];
      removePack.powerUp.push(pickUp.id);
    }
  }
};

module.exports = {
  PowerUp,
  powerUpUpdate,
};
