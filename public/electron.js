const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path');
const url = require('url')
const pkg = require('../package.json')
const canbox = require('../build/Release/canbox')

let win = null;

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
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

function nativeCallback () {
  console.log("JavaScript callback called with arguments", Array.from(arguments));
  win.webContents.send('netmanager-callback', arguments[0])
}

ipcMain.on('start-canbox', (event, arg) => {
  console.log("start canbox message comming.");
  canbox.startBox();
  //canbox.sendInfoLoop(nativeCallback, 5);
  console.log("print startbox");
  event.reply('start-canbox-complete', "start commplete.");
});

ipcMain.on('netmanager', (event, arg) => {
  console.log("netmanager from react.");
  canbox.sendInfoLoop(nativeCallback, 5);
});