const upload = document.getElementById('upload');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const downloadLink = document.getElementById('downloadLink');
const dropZone = document.getElementById('dropZone');

let img = null;
let imgX = 0;
let imgY = 0;
let imgScale = 1;
let isDragging = false;
let dragStartX, dragStartY;

// মোবাইল pinch জুমের জন্য
let lastDistance = 0;
let isPinching = false;

function drawImage() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!img) return;

    const width = img.width * imgScale;
    const height = img.height * imgScale;

    const x = imgX + (canvas.width - width) / 2;
    const y = imgY + (canvas.height - height) / 2;

    ctx.drawImage(img, x, y, width, height);
    downloadLink.href = canvas.toDataURL('image/png');
}

function processImage(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        img = new Image();
        img.onload = function() {
            imgX = 0;
            imgY = 0;
            imgScale = Math.min(canvas.width / img.width, canvas.height / img.height);
            drawImage();
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(file);
}

// ফাইল ইনপুট
upload.addEventListener('change', e => { processImage(e.target.files[0]); });

// ড্র্যাগ & ড্রপ
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', e => { e.preventDefault(); dropZone.classList.remove('dragover'); });
dropZone.addEventListener('drop', e => { e.preventDefault(); dropZone.classList.remove('dragover'); processImage(e.dataTransfer.files[0]); });

// ডেস্কটপ মাউস ড্র্যাগিং
canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragStartX = e.offsetX - imgX;
    dragStartY = e.offsetY - imgY;
});
canvas.addEventListener('mouseup', () => { isDragging = false; });
canvas.addEventListener('mouseleave', () => { isDragging = false; });
canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    imgX = e.offsetX - dragStartX;
    imgY = e.offsetY - dragStartY;
    drawImage();
});

// ডেস্কটপ স্ক্রল জুম
canvas.addEventListener('wheel', e => {
    e.preventDefault();
    const scaleAmount = e.deltaY > 0 ? 0.95 : 1.05;
    imgScale *= scaleAmount;
    drawImage();
});

// মোবাইল টাচ ড্র্যাগ
canvas.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
        isDragging = true;
        dragStartX = e.touches[0].clientX - imgX;
        dragStartY = e.touches[0].clientY - imgY;
    } else if (e.touches.length === 2) {
        isPinching = true;
        lastDistance = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
    }
});

canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (isDragging && e.touches.length === 1) {
        imgX = e.touches[0].clientX - dragStartX;
        imgY = e.touches[0].clientY - dragStartY;
        drawImage();
    } else if (isPinching && e.touches.length === 2) {
        const currentDistance = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
        const scaleChange = currentDistance / lastDistance;
        imgScale *= scaleChange;
        lastDistance = currentDistance;
        drawImage();
    }
}, { passive: false });

canvas.addEventListener('touchend', e => {
    if (e.touches.length === 0) {
        isDragging = false;
        isPinching = false;
    }
});