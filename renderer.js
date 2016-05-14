// Block Electron from rendering a external file rather than the bundled web 
// application, when a user drags that file into the Electron window.
document.ondragover = document.ondrop = (event) => {
  event.preventDefault();
};
document.body.ondrop = (event) => {
  console.log(`Opening file from drag-n-drop: ${event.dataTransfer.files[0].path}`);
  event.preventDefault();
};

require("electron").ipcRenderer.on("send-console", function(event, arg) {
  console.log(arg);
});

