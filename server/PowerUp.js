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
    this.pickUpInitPackUpdate(initPack);
  }

  update(playerList) {
    for (const i in playerList) {
      const p = playerList[i];
      if (this.getDistance(p) < 10) {
        console.log('Upgrade Mode!');
        this.toRemove = true;
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

  pickUpInitPackUpdate(initPack) {
    initPack.pickUp.push(this.getInitPack());
  }
}

const powerUpUpdate = (pickUpList, playerList, removePack) => {
  for (const i in pickUpList) {
    const pickUp = pickUpList[i];
    pickUp.update(playerList);

    if (pickUp.toRemove) {
      delete pickUpList[i];
      removePack.bullet.push(pickUp.id);
    }
  }
};

module.exports = {
  PowerUp,
  powerUpUpdate,
};
