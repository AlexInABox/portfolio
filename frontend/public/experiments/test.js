const container = document.getElementById('testBackground');
const ctx = container.getContext('2d');


const image = new Image();
image.onload = function () {
    const width = 1000;
    const height = Math.round((width / image.width) * image.height);

    ctx.canvas.width = width;
    ctx.canvas.height = height;

    const imageCanvas = document.createElement('canvas');
    const imageCtx = imageCanvas.getContext('2d');

    imageCanvas.width = width;
    imageCanvas.height = height;

    imageCtx.drawImage(image, 0, 0, width, height);

    image.data = imageCtx.getImageData(0, 0, width, height).data;
    image.width = width;
    image.height = height;


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


const LINE_LENGTH = 15;

async function drawBranches() {
    let lastPosition = { x: image.width, y: image.height };

    let previosImageDimensions = { width: image.width, height: image.height };
    while (true) {

        if (image.data === undefined) {
            await new Promise(resolve => setTimeout(resolve, 100));
            continue;
        }

        // Check if a new image has been loaded. and reset position
        if (image.width !== previosImageDimensions.width || image.height !== previosImageDimensions.height) {
            //set random position on the new image
            lastPosition = { x: Math.random() * image.width, y: Math.random() * image.height };
            previosImageDimensions = { width: image.width, height: image.height };
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
    return `rgb(${image.data[index]}, ${image.data[index + 1]}, ${image.data[index + 2]})`;
}








drawBranches(); drawBranches(); drawBranches(); drawBranches();
drawBranches(); drawBranches(); drawBranches(); drawBranches();
drawBranches(); drawBranches(); drawBranches(); drawBranches();
drawBranches(); drawBranches(); drawBranches(); drawBranches();
drawBranches(); drawBranches(); drawBranches(); drawBranches();
drawBranches(); drawBranches(); drawBranches(); drawBranches();
drawBranches(); drawBranches(); drawBranches(); drawBranches();
drawBranches(); drawBranches(); drawBranches(); drawBranches();
drawBranches(); drawBranches(); drawBranches(); drawBranches();
drawBranches(); drawBranches(); drawBranches(); drawBranches();
drawBranches(); drawBranches(); drawBranches(); drawBranches();
drawBranches(); drawBranches(); drawBranches(); drawBranches();
drawBranches(); drawBranches(); drawBranches(); drawBranches();
drawBranches(); drawBranches(); drawBranches(); drawBranches();
drawBranches(); drawBranches(); drawBranches(); drawBranches();
drawBranches(); drawBranches(); drawBranches(); drawBranches();
