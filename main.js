const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const dialog = electron.dialog;
const Menu = electron.Menu;

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
                {name: "All Media", extensions: ["jpg", "gif", "png", "mpg", "mpeg", "mp4"]},
                {name: "Images", extensions: ["jpg", "gif", "png"]},
                {name: "Videos", extensions: ["mpg", "mpeg", "mp4"]}
              ]});
            if (filenames && filenames[0]) mainWindow.webContents.send("load-file", filenames[0]);
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
  mainWindow.webContents.openDevTools();

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// Call 'createWindow()' on startup
app.on("ready", () => {
  createWindow();
  if (process.argv[1] != "main.js") {
    mainWindow.webContents.on("did-finish-load", () => {
      mainWindow.webContents.send("load-file", process.argv[1]);
    });
  }
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

