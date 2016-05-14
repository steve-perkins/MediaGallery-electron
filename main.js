const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const dialog = electron.dialog;
const Menu = electron.Menu;

// 'global.filename' holds the current image or video file to be worked with in the renderer process.  Files to open
// can be passed as arguments to the executable at startup, drag-n-dropped on the window, or selected from the
// 'File->Open' menu item.  This startup code checks for an argument passed to the executable.
global.filename = process.argv[1] == "main.js" ? undefined : process.argv[1];

// Global reference to the main window, so the garbage collector doesn't close it
let mainWindow;

// Opens the main window, with a native menu bar
function createWindow() {
  mainWindow = new BrowserWindow({width: 800, height: 600});

  let template = [
    {
      label: "File",
      submenu: [
        {
          label: "Open",
          click: () => {
            let filenames = dialog.showOpenDialog({
              properties: ["openFile"],
              filters: [
                {name: "Images", extensions: ["jpg", "gif", "png"]},
                {name: "Videos", extensions: ["mpg", "mpeg", "mp4"]}
              ]});
            mainWindow.webContents.send("send-console", `Opening file from menu: ${filenames[0]}`);
          }
        },
        {
          label: "Exit",
          click: () => {
            app.quit();
          }
        }
      ]
    }
  ];
  menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.webContents.openDevTools();
}

// Call 'createWindow()' on startup
app.on("ready", () => {
  createWindow();
  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents.send("send-console", `Opening file at startup: ${global.filename}`);
  });
});

// On OS X it is common for applications and their menu bar to stay active until the user quits explicitly
// with Cmd + Q
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
});

// On OS X it's common to re-create a window in the app when the dock icon is clicked and there are no other
// windows open.
app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

