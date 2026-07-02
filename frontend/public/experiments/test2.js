const backgroundCtx = document.getElementById('realBackground').getContext('2d');
const scratchCtx = document.getElementById('scratchOverlay').getContext('2d');

const image = new Image();
image.onload = function () {
    backgroundCtx.canvas.width = image.width;
    backgroundCtx.canvas.height = image.height;

    scratchCtx.canvas.width = image.width;
    scratchCtx.canvas.height = image.height;

    backgroundCtx.drawImage(image, 0, 0);
    scratchCtx.rect(0, 0, scratchCtx.canvas.width, scratchCtx.canvas.height);
    scratchCtx.fillStyle = 'rgba(0, 0, 0,1)';
    scratchCtx.fill();
};

var openFile = function (file) {
    var input = file.target;
    var reader = new FileReader();
    reader.onload = function () {
        var dataURL = reader.result;
        image.src = dataURL;
    };
    reader.readAsDataURL(input.files[0]);
};

let isMouseDown = false;

scratchCtx.canvas.addEventListener("mousedown", () => {
    isMouseDown = true;
});

scratchCtx.canvas.addEventListener("mousemove", (e) => {
    if (!isMouseDown) return;
    scratch(e);
});

window.addEventListener("mouseup", () => {
    isMouseDown = false;
});


function scratch(e) {
    // Get cords of mouse on canvas
    const rect = scratchCtx.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Draw a circle on the scratch canvas
    scratchCtx.beginPath();
    scratchCtx.globalCompositeOperation = 'destination-out';
    scratchCtx.arc(x, y, 20, 0, Math.PI * 2);
    scratchCtx.fill();
}
