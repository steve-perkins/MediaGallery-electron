/// <reference path="typings/index.d.ts" />
import electron = require("electron");
let ipcRenderer = electron.ipcRenderer;
let fs = require("fs");
let path = require("path");

const imageExtensions = [".jpg", ".gif", ".png"];
const videoExtensions = [".mpg", ".mpeg", ".mp4", ".webm"];
const supportedExtensions = imageExtensions.concat(videoExtensions);

// All supported files (full absolute paths) in the same directory as the last file explicitly opened
// by the user.  The explicitly-opened file will be at index position 0 in the array.  "currentIndex"
// represents the array index of the file currently rendered on the screen.
let filepaths : string[] = [];
let currentIndex = 0;
let pendingVideos : HTMLVideoElement[] = [];

// Receive log messages from the main process, which cannot access the dev tools console directly.
ipcRenderer.on("send-console", (event, arg) => {
  console.log(arg);
});

// Receive filenames selected from the main process (i.e. startup parameters or the 'File->Open' menu)
ipcRenderer.on("load-file", (event, arg) => {
  loadFile(arg);
});

// Handle files drag-n-dropped onto the browser window, so that Electron doesn't leave the page and
// load that file natively instead.
document.ondragover = document.ondrop = (event) => {
  event.preventDefault();
};
document.body.ondrop = (event) => {
  event.preventDefault();
  loadFile(event.dataTransfer.files[0].path);
};

// Handle keyboard events, to cycle through the current gallery when the user presses arrow keys.
window.onkeydown = (event) => {
  event.preventDefault();
  if (!filepaths || !filepaths.length) {
    return;
  }
  if (event.keyCode == 39 || event.keyCode == 40) {
    // Navigate forward through the gallery upon right-arrow or down-arrow keypress
    currentIndex = (currentIndex + 1 >= filepaths.length) ? 0 : currentIndex + 1;
  } else if (event.keyCode == 37 || event.keyCode == 38) {
    // Navigate backward through the gallery upon left-arrow or up-arrow keypress
    currentIndex = (currentIndex == 0) ? filepaths.length - 1 : currentIndex - 1;
  }
  // console.log(`Loading media at index position ${currentIndex}, ${filepaths[currentIndex].toString()}`);
  renderCurrentFile();
};

// TODO: Document
window.onresize = (event) => {
  if (document.getElementById("image")) {
    resizeImage();
  } else if (document.getElementById("video")) {
    resizeVideo();
  }
};

// Implement a load file event, from either the main process or the renderer process.  Validate the selected 
// file, then find all supported files in the same directory.  Results will be stored in the top-level "filepaths" 
// array, with the originally-selected file at index 0.
function loadFile(filepath : string) {
  if (!filepath) return;
  let ext = path.extname(filepath).toLowerCase();

  // Validate that the file is accessible and has a supported file extension.
  let stats = fs.statSync(filepath);
  if (!stats || !stats.isFile()) {
    console.log(`${filepath} does not exist or cannot be opened.`);
    return
  }
  if (supportedExtensions.indexOf(ext) === -1) {
    console.log(`${filepath} is not a supported file type`);
    return;
  }

  // If the file is a video, then verify that it's playable.  If its dimensions are 0x0 pixels, then that suggests
  // an unsupported codec.
  new Promise((resolve, reject) => {
    if (videoExtensions.indexOf(ext) === -1) {
      resolve();
    } else {
      let video : HTMLVideoElement = <HTMLVideoElement> document.createElement("video");
      video.src = filepath;
      video.addEventListener("loadedmetadata", () => {
        console.log(`Found ${video.videoWidth}x${video.videoHeight} for ${filepath}`);
        if (video.videoWidth === 0 || video.videoHeight === 0) {
          reject(new Error("Unplayable video"));
        } else {
          resolve();
        }
      }, false);
    }

  // Find all other supported files in the same directory.
  }).then( () => {
    filepaths = [];
    filepaths.push(filepath);
    currentIndex = 0;
    pendingVideos = [];

    let dirname = path.dirname(filepath);
    fs.readdir(dirname, (err, files : string[]) => {
      if (err) {
        console.log(err);
        return;
      }
      // let videoChecks = [];
      // videoChecks.push(Promise.resolve());
      for (let file of files) {

        // Add images to the valid list right away
        let fullPath = path.join(dirname, file);
        if (filepaths.indexOf(fullPath) === -1) {
          let ext = path.extname(file).toLowerCase();
          if (imageExtensions.indexOf(ext) !== -1) {
            filepaths.push(fullPath);
          } else if (videoExtensions.indexOf(ext) !== -1) {

            // Asynchronously check videos, and add them to the list after each one checks out.
            // let videoCheck = new Promise((resolve, reject) => {
              let video : HTMLVideoElement = <HTMLVideoElement> document.createElement("video");
              video.src = filepath;
              video.addEventListener("loadedmetadata", () => {
                console.log(`Found ${video.videoWidth}x${video.videoHeight} for ${filepath}`);
                if (video.videoWidth !== 0 && video.videoHeight !== 0) {
                  filepaths.push(file);
                  let statusSpan : HTMLSpanElement = document.getElementById("status");
                  statusSpan.innerHTML = `${currentIndex + 1} / ${filepaths.length}`;
                }
              }, false);
              video.load();
            pendingVideos.push(video);
            // });
            // videoChecks.push(videoCheck);
          }
        }
      }
      // Promise.all(videoChecks).then( () => {
        // renderCurrentFile();
      // }).catch((err) => { console.log(err); });
      renderCurrentFile();
    });
  }).catch( (err) => {
    console.log(err);
  });
}

// Render the current file (i.e. "filepaths[currentIndex]") to the screen, as either an image or
// a video.  This function is called by "loadFile()" when the user explicitly opens an image, 
// or by the arrow key event handler when the user cycles through the gallery with arrow keys.
function renderCurrentFile() {
  if (!filepaths || !filepaths.length) {
    return;
  }
  let currentFile = filepaths[currentIndex];
  let ext = path.extname(currentFile).toLowerCase();
  if ([".jpg", ".gif", ".png"].indexOf(ext) != -1) {
    renderImage(currentFile);
  } else if ([".mpg", ".mpeg", ".mp4"].indexOf(ext) != -1) {
    renderVideo(currentFile);
  }
  let statusSpan : HTMLSpanElement = document.getElementById("status");
  statusSpan.innerHTML = `${currentIndex + 1} / ${filepaths.length}`;
}

// TODO: Document
function renderImage(filename : string) {
  document.title = `MediaGallery - ${filename}`;
  let url = `file://${filename}`;  // let url = nativeImage.createFromPath(filename).toDataURL();
  let contentDiv = document.getElementById("content");
  contentDiv.innerHTML = `<img id="image" src="${url}"/>`;
  let image : HTMLImageElement = <HTMLImageElement> document.getElementById("image");
  image.addEventListener("load", resizeImage, false);
}

// TODO: Document
function renderVideo(filename : string) {
  document.title = `MediaGallery - ${filename}`;
  let url = `file://${filename}`;
  let contentDiv = document.getElementById("content");
  contentDiv.innerHTML = `<video id="video" src="${url}" controls/>`;
  let video : HTMLVideoElement = <HTMLVideoElement> document.getElementById("video");
  video.addEventListener("loadedmetadata", resizeVideo, false);
}

// TODO: Document
function resizeImage() {
  let contentDiv = document.getElementById("content");
  let image : HTMLImageElement = <HTMLImageElement> document.getElementById("image");
  image.style.width = image.style.height = null;
  if (image.naturalWidth / contentDiv.clientWidth > image.naturalHeight / contentDiv.clientHeight) {
    image.style.width = "100%";
  } else {
    image.style.height = "100%";
  }
}

// TODO: Document
function resizeVideo() {
  let contentDiv = document.getElementById("content");
  let video : HTMLVideoElement = <HTMLVideoElement> document.getElementById("video");
  video.style.width = video.style.height = null;
  if (video.videoWidth / contentDiv.clientWidth > video.videoHeight / contentDiv.clientHeight) {
    video.style.width = "100%";
  } else {
    video.style.height = "100%";
  }
}
