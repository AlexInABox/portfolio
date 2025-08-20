const container = document.getElementById("starBackground");
const numStars = 300; // Reduced from 200

for (let i = 0; i < numStars; i++) {
  const scale = Math.random() * 2 + 1;
  const star = document.createElement("div");
  star.className = "star";
  star.style.left = Math.random() * 100 + "%";
  star.style.top = Math.random() * 100 + "%";
  star.style.width = scale + "px";
  star.style.height = scale + "px";
  star.style.animationDelay = Math.random() * 3 + "s";
  container.appendChild(star);
}
