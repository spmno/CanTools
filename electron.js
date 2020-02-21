const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path');
const url = require('url')
const pkg = require('./package.json')
const canbox = require('./build/Release/canbox')


function createWindow () {
  // Create the browser window.
  let win = new BrowserWindow({
    width: 1024,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  if (pkg.devMode) 
    win.loadURL('http://localhost:3000/');
  else 
    win.loadURL(url.format({
      pathname: path.join(__dirname, './index.html'),
      protocol: 'file',
      slashes: true
    }));

    console.log('app started.');
}

app.whenReady().then(createWindow)

ipcMain.on('start-canbox', (event, arg) => {
  console.log("start canbox message comming.");
  //canbox.startBox();
  canbox.sendInfoLoop(function () {
    console.log("JavaScript callback called with arguments", Array.from(arguments));
  }, 5);
  console.log("print startbox");
  event.reply('start-canbox-complete', "start commplete.");
});