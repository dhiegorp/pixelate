const webcam = document.querySelector(".webcam");
const mainCanvas = document.querySelector(".video");
const faceCanvas = document.querySelector(".face");
const mainContext = mainCanvas.getContext('2d');

const faceContext = faceCanvas.getContext(`2d`);

const faceDetector = new FaceDetector();
const SIZE = 10;
const SCALE = 1.5;

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
        SIZE,  //how wide?
        SIZE,

    );

    let { width, height } = details;
    width *= SCALE;
    height *= SCALE;

    //draw a smaller face but scalling it up to create the  "pixelated" effect
    faceContext.drawImage(
        faceCanvas,
        details.x,
        details.y,
        SIZE,
        SIZE,
        details.x - (width - details.width) / 2,
        details.y - (height - details.height) / 2,
        width,
        height

    )
}


streamVideo().then(detect);