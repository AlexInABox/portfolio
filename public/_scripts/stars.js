const container = document.getElementById('starBackground');
const ctx = container.getContext('2d');
ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;

let mouseX = 0;
let mouseY = 0;
let mouseDown = false;

const numStars = 1500;
let listOfLayer1Stars = [[0, 0]];
let listOfLayer2Stars = [[0, 0]];
let listOfLayer3Stars = [[0, 0]];
const layer1Size = 0.5;
const layer2Size = 1;
const layer3Size = 1.5;

let listOfConstellation1Group = []; // This is the list of indexes of the stars in the layer3 list!

const numComets = 10;
let listOfCometPositions = [[0, 0]];
let listOfCometVelocities = [[0, 0]];
const maxVelocity = 5;

function initializeBackground() {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  listOfLayer1Stars = [[0, 0]];
  listOfLayer2Stars = [[0, 0]];
  listOfLayer3Stars = [[0, 0]];

  function place(layer, size) {
    for (let i = 0; i < numStars / 3; i++) {
      const x = (Math.random() * ctx.canvas.width) % ctx.canvas.width;
      const y = (Math.random() * ctx.canvas.height) % ctx.canvas.height;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fillStyle = 'white';
      ctx.fill();

      layer[layer.length] = [x, y];
    }
  }
  place(listOfLayer1Stars, layer1Size);
  place(listOfLayer2Stars, layer2Size);
  place(listOfLayer3Stars, layer3Size);

  const randomConstellationX = (Math.random() * ctx.canvas.width) % ctx.canvas.width;
  const randomConstellationY = (Math.random() * ctx.canvas.height) % ctx.canvas.height;
  const threshold = 125; //distance from constellation center to consider a star part of the constellation

  for (let i = 0; i < listOfLayer3Stars.length; i++) {
    if (listOfConstellation1Group.length >= 7) break; // Limit the number of stars in the constellation
    const [x, y] = listOfLayer3Stars[i];
    const distance = Math.sqrt((x - randomConstellationX) ** 2 + (y - randomConstellationY) ** 2);
    if (distance < threshold) {
      listOfConstellation1Group.push(i);
    }
  }

  // place the comets
  for (let i = 0; i < numComets; i++) {
    const x = (Math.random() * ctx.canvas.width) % ctx.canvas.width;
    const y = (Math.random() * ctx.canvas.height) % ctx.canvas.height;
    listOfCometPositions[i] = [x, y];
    listOfCometVelocities[i] = [0, 0];
  }
}
initializeBackground();

function moveAndDrawComet() {
  listOfCometPositions.forEach((comet, index) => {
    let [x, y] = comet;
    let [velX, velY] = listOfCometVelocities[index];
    let [targetX, targetY] = [mouseX, mouseY];

    let [directionX, directionY] = [targetX - x, targetY - y];
    let distance = Math.hypot(directionX, directionY);

    velX += (directionX / distance) * 0.1;
    velY += (directionY / distance) * 0.1;

    velX = Math.min(velX, maxVelocity);
    velY = Math.min(velY, maxVelocity);

    if (x > ctx.canvas.width) velX -= 2;
    if (x < 0) velX += 2;
    if (y > ctx.canvas.height) velY -= 2;
    if (y < 0) velY += 2;

    x += velX;
    y += velY;

    listOfCometVelocities[index] = [velX, velY];
    listOfCometPositions[index] = [x, y];

    ctx.beginPath();
    ctx.arc(x, y, layer3Size, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
  });
}

function moveStars() {
  if (getValueForSetting('backgroundStarsActive') !== 'true') return;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  function move(layer, speed, size) {
    for (i = 0; i < layer.length; i++) {
      let [x, y] = layer[i];

      if (x - mouseX > -80 && x - mouseX < 80 && y - mouseY > -80 && y - mouseY < 80 && mouseDown) {
        x = x - (x - mouseX) / 20;
        y = y - (y - mouseY) / 20;
      } else {
        x = (x + speed) % ctx.canvas.width;
        y = (y + speed) % ctx.canvas.height;
      }

      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fillStyle = 'white';
      ctx.fill();
      layer[i] = [x, y];
    }
  }

  move(listOfLayer1Stars, 0.25, layer1Size);
  move(listOfLayer2Stars, 0.45, layer2Size);
  move(listOfLayer3Stars, 0.65, layer3Size);

  let lastPosition = {
    x: listOfLayer3Stars[listOfConstellation1Group[0]][0],
    y: listOfLayer3Stars[listOfConstellation1Group[0]][1],
  };
  ctx.beginPath();
  ctx.moveTo(lastPosition.x, lastPosition.y);

  for (let i = 1; i < listOfConstellation1Group.length; i++) {
    const [x, y] = listOfLayer3Stars[listOfConstellation1Group[i]];

    // If line is too long, skip drawing it
    const distance = Math.sqrt((x - lastPosition.x) ** 2 + (y - lastPosition.y) ** 2);
    if (distance > 200) {
      lastPosition = { x, y };
      ctx.moveTo(x, y);
      continue;
    }

    ctx.lineTo(x, y);
    lastPosition = { x, y };
  }
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 2;
  ctx.stroke();

  moveAndDrawComet();
}
setInterval(() => moveStars(), 10);

addEventListener('resize', (_) => {
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;

  initializeBackground();
});

addEventListener('mousemove', function (e) {
  function getMousePosition(canvas, event) {
    let rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
  }
  getMousePosition(container, e);
});

document.body.onmousedown = function () {
  mouseDown = true;
};
document.body.onmouseup = function () {
  mouseDown = false;
};
