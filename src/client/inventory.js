class Inventory {
  constructor(items, socket, server) {
    this.items = items;
    this.socket = socket;
    this.server = server;
  }

  addItem (id, amount) {
    for (let i = 0; i < this.items.length; i++) {
        if (this.items[i].id == id) {
          this.items[i].amount += amount;
          this.refreshRender();
          return
        }
    }
    this.items.push({ id, amount });
    this.refreshRender();
  }

  removeItem (id, amount) {
      for (let i = 0; i < this.items.length; i++) {
          if (this.items[i].id === id) {
              
          }
      }
  }
}


  self.removeItem = function (id, amount) {
    for (let i = 0; i < self.items.length; i++) {
      if (self.items[i].id === id) {
        self.items[i].amount -= amount;
        if (self.items[i].amount <= 0) self.items.splice(i, 1);
        self.refreshRender();
        return;
      }
    }
  };

  self.hasItem = function (id, amount) {
    for (let i = 0; i < self.items.length; i++) {
      if (self.items[i].id === id) {
        return self.items[i].amount >= amount;
      }
    }
    return false;
  };

  self.refreshRender = function () {
    // server
    if (self.server) {
      self.socket.emit('updateInventory', self.items);
      return;
    }
    // client only
    const inventory = document.getElementById('inventory');
    inventory.innerHTML = '';
    const addButton = function (data) {
      const item = Item.list[data.id];
      const button = document.createElement('button');
      button.onclick = function () {
        self.socket.emit('useItem', item.id);
      };
      button.innerText = `${item.name} x${data.amount}`;
      inventory.appendChild(button);
    };
    for (let i = 0; i < self.items.length; i++) addButton(self.items[i]);
  };
  if (self.server) {
    self.socket.on('useItem', (itemId) => {
      if (!self.hasItem(itemId, 1)) {
        console.log('Cheater');
        return;
      }
      const item = Item.list[itemId];
      item.event(Player.list[self.socket.id]);
    });
  }

  return self;
};

Item = function (id, name, event) {
  const self = {
    id,
    name,
    event,
  };
  Item.list[self.id] = self;
  return self;
};
Item.list = {};

Item('potion', 'Potion', (player) => {
  player.hp = 10;
  player.inventory.removeItem('potion', 1);
  player.inventory.addItem('superAttack', 1);
});

Item('superAttack', 'Super Attack', (player) => {
  for (let i = 0; i < 360; i++) player.shootBullet(i);
});
