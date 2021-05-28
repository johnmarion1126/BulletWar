const WIDTH = 500;
const HEIGHT = 500;
const socket = io();

// sign
const signDiv = document.getElementById('signDiv');
const signDivUsername = document.getElementById('signDiv-username');
const signDivSignIn = document.getElementById('signDiv-signIn');
const signDivSignUp = document.getElementById('signDiv-signUp');
const signDivPassword = document.getElementById('signDiv-password');
const gameDiv = document.getElementById('gameDiv');

signDivSignIn.onclick = function () {
  socket.emit('signIn', {
    username: signDivUsername.value,
    password: signDivPassword.value,
  });
};

signDivSignUp.onclick = function () {
  socket.emit('signUp', {
    username: signDivUsername.value,
    password: signDivPassword.value,
  });
};

socket.on('signInResponse', (data) => {
  if (data.success) {
    signDiv.style.display = 'none';
    gameDiv.style.display = 'inline-block';
  } else alert('Sign in unsuccessful.');
});

socket.on('signUpResponse', (data) => {
  if (data.success) {
    alert('Sign up successful.');
  } else alert('Sign up unsuccessful.');
});

// chat
const chatText = document.getElementById('chat-text');
const chatInput = document.getElementById('chat-input');
const chatForm = document.getElementById('chat-form');

socket.on('addToChat', (data) => {
  chatText.innerHTML += `<div>${data}</div>`;
});

socket.on('evalAnswer', (data) => {
  console.log(data);
});

chatForm.onsubmit = function (e) {
  e.preventDefault();
  if (chatInput.value[0] === '/') {
    socket.emit('evalServer', chatInput.value.slice(1));
  } else if (chatInput.value[0] === '@') {
    socket.emit('sendPmToServer', {
      username: chatInput.value.slice(1, chatInput.value.indexOf(',')),
      message: chatInput.value.slice(chatInput.value.indexOf(',') + 1),
    });
  } else {
    socket.emit('sendMsgToServer', chatInput.value);
    chatInput.value = '';
  }
};

// ui
const changeMap = function () {
  socket.emit('changeMap');
};

const inventory = new Inventory([], socket, false);
socket.on('updateInventory', (items) => {
  inventory.items = items;
  inventory.refreshRender();
});

// game
const Img = {};
Img.player = new Image();
Img.player.src = '/client/img/player.png';
Img.bullet = new Image();
Img.bullet.src = '/client/img/bullet.png';

Img.map = {};
Img.map.field = new Image();
Img.map.field.src = '/client/img/map.png';
Img.map.forest = new Image();
Img.map.forest.src = '/client/img/map2.png';

const ctx = document.getElementById('ctx').getContext('2d');
const ctxUi = document.getElementById('ctx-ui').getContext('2d');
ctxUi.font = '30px Arial';

const Player = function (initPack) {
  const self = {};
  self.id = initPack.id;
  self.number = initPack.number;
  self.x = initPack.x;
  self.y = initPack.y;
  self.hp = initPack.hp;
  self.hpMax = initPack.hpMax;
  self.score = initPack.score;
  self.map = initPack.map;

  self.draw = function () {
    if (Player.list[selfId].map !== self.map) return;
    const x = self.x - Player.list[selfId].x + WIDTH / 2;
    const y = self.y - Player.list[selfId].y + HEIGHT / 2;

    const hpWidth = (30 * self.hp) / self.hpMax;
    ctx.fillStyle = 'red';
    ctx.fillRect(x - hpWidth / 2, y - 40, hpWidth, 4);

    const width = Img.player.width * 2;
    const height = Img.player.height * 2;

    ctx.drawImage(
      Img.player,
      0,
      0,
      Img.player.width,
      Img.player.height,
      x - width / 2,
      y - height / 2,
      width,
      height,
    );

    // ctx.fillText(self.score,self.x,self.y-60);
  };

  Player.list[self.id] = self;
  return self;
};
Player.list = {};

const Bullet = function (initPack) {
  const self = {};
  self.id = initPack.id;
  self.x = initPack.x;
  self.y = initPack.y;
  self.map = initPack.map;

  self.draw = function () {
    if (Player.list[selfId].map !== self.map) return;
    const width = Img.bullet.width / 2;
    const height = Img.bullet.height / 2;

    const x = self.x - Player.list[selfId].x + WIDTH / 2;
    const y = self.y - Player.list[selfId].y + HEIGHT / 2;

    ctx.drawImage(
      Img.bullet,
      0,
      0,
      Img.bullet.width,
      Img.bullet.height,
      x - width / 2,
      y - height / 2,
      width,
      height,
    );
  };

  Bullet.list[self.id] = self;
  return self;
};
Bullet.list = {};

let selfId = null;

socket.on('init', (data) => {
  if (data.selfId) selfId = data.selfId;
  for (let i = 0; i < data.player.length; i++) {
    new Player(data.player[i]);
  }
  for (let i = 0; i < data.bullet.length; i++) {
    new Bullet(data.bullet[i]);
  }
});

socket.on('update', (data) => {
  for (let i = 0; i < data.player.length; i++) {
    const pack = data.player[i];
    const p = Player.list[pack.id];
    if (p) {
      if (pack.x !== undefined) p.x = pack.x;
      if (pack.y !== undefined) p.y = pack.y;
      if (pack.hp !== undefined) p.hp = pack.hp;
      if (pack.score !== undefined) p.score = pack.score;
      if (pack.map !== undefined) p.map = pack.map;
    }
  }

  for (let i = 0; i < data.bullet.length; i++) {
    const pack = data.bullet[i];
    const b = Bullet.list[data.bullet[i].id];
    if (b) {
      if (pack.x !== undefined) b.x = pack.x;
      if (pack.y !== undefined) b.y = pack.y;
    }
  }
});

socket.on('remove', (data) => {
  for (let i = 0; i < data.player.length; i++) {
    delete Player.list[data.player[i]];
  }
  for (let i = 0; i < data.bullet.length; i++) {
    delete Bullet.list[data.bullet[i]];
  }
});

setInterval(() => {
  if (!selfId) return;
  ctx.clearRect(0, 0, 500, 500);
  drawMap();
  drawScore();
  for (const i in Player.list) Player.list[i].draw();
  for (const i in Bullet.list) Bullet.list[i].draw();
}, 40);

const drawMap = function () {
  const player = Player.list[selfId];
  const x = WIDTH / 2 - player.x;
  const y = HEIGHT / 2 - player.y;
  ctx.drawImage(Img.map[player.map], x, y);
};

const drawScore = function () {
  if (lastScore === Player.list[selfId].score) return;
  lastScore = Player.list[selfId].score;
  ctxUi.clearRect(0, 0, 500, 500);
  ctx.fillStyle = 'white';
  ctx.fillText(Player.list[selfId].score, 0, 30);
};
let lastScore = null;

document.onkeydown = function (event) {
  if (event.keyCode === 68)
    // d
    socket.emit('keyPress', { inputId: 'right', state: true });
  else if (event.keyCode === 83)
    // s
    socket.emit('keyPress', { inputId: 'down', state: true });
  else if (event.keyCode === 65)
    // a
    socket.emit('keyPress', { inputId: 'left', state: true });
  else if (event.keyCode === 87)
    // w
    socket.emit('keyPress', { inputId: 'up', state: true });
};

document.onkeyup = function (event) {
  if (event.keyCode === 68)
    // d
    socket.emit('keyPress', { inputId: 'right', state: false });
  else if (event.keyCode === 83)
    // s
    socket.emit('keyPress', { inputId: 'down', state: false });
  else if (event.keyCode === 65)
    // a
    socket.emit('keyPress', { inputId: 'left', state: false });
  else if (event.keyCode === 87)
    // w
    socket.emit('keyPress', { inputId: 'up', state: false });
};

document.onmousedown = function (event) {
  socket.emit('keyPress', { inputId: 'attack', state: true });
};

document.onmouseup = function (event) {
  socket.emit('keyPress', { inputId: 'attack', state: false });
};

document.onmousemove = function (event) {
  const x = -250 + event.clientX - 8;
  const y = -250 + event.clientY - 8;
  const angle = (Math.atan2(y, x) / Math.PI) * 180;
  socket.emit('keyPress', { inputId: 'mouseAngle', state: angle });
};

document.oncontextmenu = function (event) {
  event.preventDefault();
};
