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
}
initializeBackground();

function moveStars() {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  function move(layer, speed, size) {
    for (i = 0; i < layer.length; i++) {
      let [x, y] = layer[i];

      if (x - mouseX > -50 && x - mouseX < 50 && y - mouseY > -50 && y - mouseY < 50 && mouseDown) {
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