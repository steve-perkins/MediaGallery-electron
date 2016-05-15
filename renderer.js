let fs = require("fs");
let ipcRenderer = require("electron").ipcRenderer;
let path = require("path");

// Receive log messages from the main process, which cannot access the dev tools console directly
ipcRenderer.on("send-console", (event, arg) => {
  console.log(arg);
});

// Receive filenames selected from the main process (i.e. startup parameters or the 'File->Open' menu
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

// Implement a load file event, from either the main process or the renderer process.
function loadFile(filepath) {
  console.log(`Opening file: ${filepath}`);
  if (!filepath) return;

  fs.stat(filepath, (err, stats) => {
    // Validate the selected file
    if (err) {
      console.log(err); return;
    }
    if (!stats.isFile()) {
      console.log(`${filepath} cannot be opened`); return;
    }
    let supportedExtensions = [".jpg", ".gif", ".png", ".mpg", ".mpeg", ".mp4"];
    let ext = path.extname(filepath).toLowerCase();
    if (supportedExtensions.indexOf(ext) === -1) {
      console.log(`${filepath} is not a supported file type`);
      return;
    }

    // Find all other supported files within the same directory
    let otherFiles = [];
    let dirname = path.dirname(filepath);
    fs.readdir(dirname, (err, files) => {
      if (err) { console.log(err); return; }
      for (file of files) {
        let ext = path.extname(file).toLowerCase();
        if (supportedExtensions.indexOf(ext) === -1) continue;
        let fullPath = path.join(dirname, file);
        if (fullPath !== filepath && otherFiles.indexOf(fullPath) === -1) {
          otherFiles.push(path);
        }
      }
      let selectedFileSpan = document.getElementById("selectedFile");
      selectedFileSpan.innerText = selectedFileSpan.textContent = filepath;
      let fileCountSpan = document.getElementById("fileCount");
      fileCountSpan.innerText = fileCountSpan.textContent = otherFiles.length + 1;
    })
  });
}
