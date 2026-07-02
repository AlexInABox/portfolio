const container = document.getElementById('testBackground');
const ctx = container.getContext('2d');


const image = new Image();
image.onload = function () {
    ctx.canvas.width = image.width;
    ctx.canvas.height = image.height;

    const imageCanvas = document.createElement('canvas');
    const imageCtx = imageCanvas.getContext('2d');
    imageCtx.canvas.width = image.width;
    imageCtx.canvas.height = image.height;
    imageCtx.drawImage(image, 0, 0);
    image.data = imageCtx.getImageData(0, 0, image.width, image.height).data;

    // Destroy the imageCanvas to free up memory
    imageCanvas.remove();
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


const LINE_LENGTH = 20;

async function drawBranches() {

    let lastPosition = { x: ctx.canvas.width / 2, y: ctx.canvas.height / 2 };
    //ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    while (true) {
        if (image.data === undefined) {
            await new Promise(resolve => setTimeout(resolve, 100));
            continue;
        }
        ctx.beginPath();
        ctx.moveTo(lastPosition.x, lastPosition.y);

        let einheitsvektor = getRandomEinheitsvektor();

        while (lastPosition.x + einheitsvektor.x * LINE_LENGTH > ctx.canvas.width || lastPosition.x + einheitsvektor.x * LINE_LENGTH < 0 ||
            lastPosition.y + einheitsvektor.y * LINE_LENGTH > ctx.canvas.height || lastPosition.y + einheitsvektor.y * LINE_LENGTH < 0) {
            einheitsvektor = getRandomEinheitsvektor();
        }

        lastPosition.x += einheitsvektor.x * LINE_LENGTH;
        lastPosition.y += einheitsvektor.y * LINE_LENGTH;
        ctx.lineTo(lastPosition.x, lastPosition.y);
        ctx.strokeStyle = getColorAtPosition(lastPosition.x, lastPosition.y);
        ctx.lineWidth = 5;
        ctx.stroke();

        await new Promise(resolve => setTimeout(resolve, 1));
    }
}

function getRandomEinheitsvektor() {
    let x = Math.random() * 2 - 1;
    let y = Math.random() * 2 - 1;
    let length = Math.sqrt(x * x + y * y);
    return { x: x / length, y: y / length };
}



function getColorAtPosition(x, y) {
    // Round down x and y to the nearest integer
    x = Math.floor(x);
    y = Math.floor(y);

    const index = (y * image.width + x) * 4;

    console.log(`x: ${x}, y: ${y}, index: ${index}, r: ${image.data[index]}, g: ${image.data[index + 1]}, b: ${image.data[index + 2]}`);
    return `rgb(${image.data[index]}, ${image.data[index + 1]}, ${image.data[index + 2]})`;
}








drawBranches(); drawBranches(); drawBranches(); drawBranches();