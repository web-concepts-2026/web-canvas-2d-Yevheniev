const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true});
const sizeInput = document.querySelector("#brush-size");
const colorInput = document.querySelector("#brush-color");
const sizeValue = document.querySelector("#size-value");
const drawButton = document.querySelector("#draw-button");
const eraseButton = document.querySelector("#erase-button");
const clearButton = document.querySelector("#clear-button");
const undoButton = document.querySelector("#undo-button");
const stampButton = document.querySelector("#stamp-button");
let currentTool = "draw";
let isDrawing = false;
let lastX = 0;
let lastY = 0;
const history = [];
undoButton.disabled = true;
ctx.lineCap = "round";

sizeInput.addEventListener("input", updateBrushSize);
window.addEventListener("pageshow", updateBrushSize);
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseleave", stopDrawing);
window.addEventListener("mouseup", stopDrawing);
window.addEventListener("blur", stopDrawing);
drawButton.addEventListener("click", function () {
    setTool("draw");
});
eraseButton.addEventListener("click", function () {
    setTool("erase");
});
clearButton.addEventListener("click", function () {
    stopDrawing();
    saveState();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});
undoButton.addEventListener("click", function(){
    stopDrawing();
    if(history.length === 0){
        return;
    }

    const snapshot = history.pop();
    ctx.putImageData(snapshot, 0, 0);
    undoButton.disabled = history.length === 0;
});
stampButton.addEventListener("click", function(){
    setTool("stamp");
});

function startDrawing(event) {
    if (event.button !== 0) {
        return;
    }

    saveState();

    if(currentTool === "stamp"){
        ctx.save();
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "#000000";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("★", event.offsetX, event.offsetY);
        ctx.restore();
        return;
    }

    isDrawing = true;
    lastX = event.offsetX;
    lastY = event.offsetY;
    ctx.lineWidth = Number(sizeInput.value);
    ctx.strokeStyle = colorInput.value;
    ctx.fillStyle = colorInput.value;

    if (currentTool === "erase") {
        ctx.globalCompositeOperation = "destination-out";
    } else {
        ctx.globalCompositeOperation = "source-over";
    }

    ctx.beginPath();
    ctx.arc(lastX, lastY, ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.fill();
}

function draw(event) {
    if (!isDrawing) {
        return;
    }

    const x = event.offsetX;
    const y = event.offsetY;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    lastX = x;
    lastY = y;
}

function stopDrawing() {
    isDrawing = false;
}

function setTool(tool) {
    currentTool = tool;
    drawButton.classList.toggle("active", tool === "draw");
    eraseButton.classList.toggle("active", tool === "erase");
    stampButton.classList.toggle("active", tool === "stamp");
}

setTool("draw");

function saveState(){
    const snapshot = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
    );

    history.push(snapshot);
    undoButton.disabled = false;
}

function updateBrushSize(){
    sizeValue.textContent = sizeInput.value;
}
