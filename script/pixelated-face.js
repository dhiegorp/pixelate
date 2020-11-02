const optionSliders = document.querySelectorAll('.controls input[type=range]');

const webcam = document.querySelector(".webcam");
const mainCanvas = document.querySelector(".video");
const faceCanvas = document.querySelector(".face");

const mainContext = mainCanvas.getContext('2d');
const faceContext = faceCanvas.getContext(`2d`);

const faceDetector = new FaceDetector();


const options = {
    size: 10,
    scale: 1.5
}

optionSliders.forEach(slider =>
    slider.addEventListener('input',
        (event) => {
            let { name, value } = event.currentTarget;
            options[name] = value;
        }
    )
);

console.log(webcam, mainCanvas, faceCanvas, mainContext, faceContext, faceDetector);

const streamVideo = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: {
            width: 1280,
            height: 720
        }
    });
    webcam.srcObject = stream;
    await webcam.play();

    adjustCanvasSize(mainCanvas, webcam);
    adjustCanvasSize(faceCanvas, webcam);

};

const adjustCanvasSize = (canvas, { videoHeight, videoWidth }) => {
    canvas.height = videoHeight;
    canvas.width = videoWidth;
};

const detect = async () => {

    const faces = await faceDetector.detect(webcam);

    faces.forEach(drawFaceBoundary);
    faces.forEach(pixelateFace);
    requestAnimationFrame(detect);
}

const drawFaceBoundary = (face) => {
    const { width, height, top, left } = face.boundingBox;
    mainContext.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    mainContext.strokeStyle = '#FF0000';
    mainContext.lineWidth = 2;
    mainContext.strokeRect(left, top, width, height);

}

const pixelateFace = ({ boundingBox: details }) => {
    //draw small face
    //and draw it back  as detected size 
    faceContext.clearRect(0, 0, faceCanvas.width, faceCanvas.height);
    faceContext.drawImage(
        webcam, // source
        details.x, // start of source pull
        details.y,
        details.width,
        details.height,
        details.x, // start of drawing x,y
        details.y,
        options.size,  //how wide?
        options.size,

    );

    let { width, height } = details;
    width *= options.scale;
    height *= options.scale;

    //draw a smaller face but scalling it up to create the  "pixelated" effect
    faceContext.drawImage(
        faceCanvas,
        details.x,
        details.y,
        options.size,
        options.size,
        details.x - (width - details.width) / 2,
        details.y - (height - details.height) / 2,
        width,
        height

    )
}


streamVideo().then(detect);