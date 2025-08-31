const container = document.getElementById("starBackground");
const numStars = 200;

let mouseX = -100;
let mouseY = -100;
this.addEventListener("mousemove", storeMousePos);
function storeMousePos(e) {
  mouseX = e.pageX;
  mouseY = e.pageY;
}

//star moving directions
upOrDown = Math.round(Math.random()) * 2 - 1;
leftOrRight = (Math.random() - 0.5) * 2;

function populateStarsWithClassName(className) {
  for (let i = 0; i < numStars; i++) {
    const starScale = Math.random() * 2 + 1;
    const detectorScale = 90;
    const star = document.createElement("div");
    const detector = document.createElement("div");

    star.className = "star " + className;
    star.style.left = Math.random() * 110 + "%";
    star.style.top = Math.random() * 110 + "%";
    star.style.width = starScale + "px";
    star.style.height = starScale + "px";
    star.style.animationDelay = Math.random() * 3 + "s";
    container.appendChild(star);

    detector.className = "detector";
    detector.style.width = detectorScale + "px";
    detector.style.height = detectorScale + "px";

    star.appendChild(detector);
  }
}

function moveStarsByLayerAndSpeed(layer, speed) {
  var stars = document.getElementsByClassName(layer);
  for (const star of stars) {
    let horizontal = parseFloat(star.style.left.slice(0, -1));
    let vertical = parseFloat(star.style.top.slice(0, -1));
    horizontal = (horizontal + speed * leftOrRight + 110) % 110;
    vertical = (vertical + speed * upOrDown + 110) % 110;
    star.style.left = horizontal + "%";
    star.style.top = vertical + "%";
  }
}
populateStarsWithClassName("layer1");
populateStarsWithClassName("layer2");
populateStarsWithClassName("layer3");

setInterval(() => moveStarsByLayerAndSpeed("layer1", 0.1), 100);
setInterval(() => moveStarsByLayerAndSpeed("layer2", 0.05), 100);
setInterval(() => moveStarsByLayerAndSpeed("layer3", 0.02), 100);

setInterval(() => pushStarsAway(), 10);

function pushStarsAway() {
  const _overlapped = document.elementsFromPoint(mouseX, mouseY);
  const _included = _overlapped.filter((el) => el.className == "detector");

  _included.forEach((element) => {
    let rect = element.parentElement.getBoundingClientRect();
    let centerX = rect.left + rect.width / 2;
    let centerY = rect.top + rect.height / 2;

    let dx = mouseX - centerX;
    let dy = mouseY - centerY;

    let dist = Math.sqrt(dx * dx + dy * dy);
    let factor = 100 / dist;

    let newX = rect.left - dx * factor * 0.03;
    let newY = rect.top - dy * factor * 0.03;

    element.parentElement.style.left =
      (newX / visualViewport.width) * 100 + "%";
    element.parentElement.style.top =
      (newY / visualViewport.height) * 100 + "%";
  });
}
