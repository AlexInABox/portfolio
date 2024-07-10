const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const enhance = id => {
    const element = document.getElementById(id),
        text = element.innerText.split("");

    element.innerText = "";

    text.forEach((value, index) => {
        const outer = document.createElement("span");

        outer.className = "outer";

        const inner = document.createElement("span");

        inner.className = "inner";

        inner.style.animationDelay = `${rand(-5000, 0)}ms`;

        const letter = document.createElement("span");

        letter.className = "letter";

        letter.innerText = value;

        letter.style.animationDelay = `${index * 1000}ms`;

        inner.appendChild(letter);

        outer.appendChild(inner);

        element.appendChild(outer);
    });
}

enhance("channel-link");

var links = document.getElementsByTagName('a'); for (var i = 0, il = links.length; i < il; i++) { links[i].onclick = clickHandler; }

function clickHandler(event) {

    event.preventDefault();

    document.body.style.transition = "opacity 0.5s";
    document.body.style.opacity = 0;


    var travelTo = this.getAttribute("href");

    setTimeout(function () { window.location.href = travelTo; }, 500);
}