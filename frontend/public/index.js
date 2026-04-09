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

function switchContent(contentButtonId) {
  const contentButtons = document.getElementsByClassName("contentButtons");
  for (let button of contentButtons) {
    button.className = "contentButtons";
    if (button.id == contentButtonId) {
      button.className = "activeContentButton contentButtons"
    }
  }

  const contents = document.getElementsByClassName("content");
  const contentId = contentButtonId.replace('Button', '');
  for (let content of contents) {
    content.className = "content hidden";
    if (content.id == contentId) {
      content.className = "content";
    }
  }
}



const blogContent = document.getElementById('blogContent');
const td = blogContent.parentElement;
// If the cells height changes, we make sure the blog content doesnt extend too far, as to not grow the td again.
const observer = new ResizeObserver(() => {
  blogContent.style.maxHeight = td.clientHeight * 0.9 + 'px';
});

observer.observe(td);


async function findBlogs() {
  const blogs = [];
  let i = 1;

  while (true) {
    const url = `/blogs/${i}.json`;
    const res = await fetch(url, { method: 'HEAD' }); // just check if it exists
    if (!res.ok) break; // stop on first 404
    blogs.push(i);
    i++;
  }

  return blogs;
}

async function loadBlogs() {
  const blogIds = (await findBlogs()).reverse();

  for (const blogId of blogIds) {
    const blogJson = await fetch(`/blogs/${blogId}.json`);
    if (!blogJson.ok) continue;

    const blogContainer = document.createElement('div');
    blogContainer.className = 'singleBlogContainer';

    const img = document.createElement('img');
    img.src = `/blogs/${blogId}.webp`;
    img.className = 'blogImage';
    img.alt = 'blog image';
    img.onerror = () => img.remove();
    img.onclick = () => {
      window.open(`/blogs/${blogId}.png`, '_blank');
    }

    blogContainer.appendChild(img);

    const data = await blogJson.json();
    const blogTextContainer = document.createElement('div');
    blogTextContainer.className = 'blogTextContainer';

    blogTextContainer.innerHTML += `<h1 class="blogHtml">${data.date}</h1>`;
    if (isToday(data.date)) {
      blogTextContainer.innerHTML = `<h1 class="blogHtml">Today</h1>`;
    }
    if (isYesterday(data.date)) {
      blogTextContainer.innerHTML = `<h1 class="blogHtml">Yesterday</h1>`;
    }

    for (const paragraphs of data.html) {
      blogTextContainer.innerHTML += `<p class="blogHtml">${paragraphs}</p>`;
    }
    blogContainer.appendChild(blogTextContainer);
    blogContent.appendChild(blogContainer);
  }
}

loadBlogs();


function isToday(dateString) {
  const [day, month, year] = dateString.split('.').map(Number);
  const today = new Date();
  console.log(day, month, year, today.getDate(), today.getMonth() + 1, today.getFullYear());
  return day === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear();
}

function isYesterday(dateString) {
  const [day, month, year] = dateString.split('.').map(Number);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return day === yesterday.getDate() && month === yesterday.getMonth() + 1 && year === yesterday.getFullYear();
}