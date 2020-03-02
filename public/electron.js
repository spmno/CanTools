const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path');
const url = require('url')
const pkg = require('../package.json')
const canbox = require('../build/Release/canbox')

let win = null;
var CanboxStatus = {
  OPEN: 1,
  CLOSE: 2,
  ERROR: 3,
};

var boxStatus = CanboxStatus.CLOSE;

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
  console.log("JavaScript callback called with arguments", arguments);
  win.webContents.send('netmanager-callback', arguments)
}

ipcMain.on('start-canbox', (event, arg) => {
  console.log("start canbox message comming.");
  if (canbox.startBox()) {
    boxStatus = CanboxStatus.OPEN;
    event.reply('start-canbox-complete', "start commplete.");
    console.log("start success, electronjs");
  } else {
    boxStatus = CanboxStatus.ERROR;
    event.reply('start-canbox-complete', "start error.");
    console.log("start error, electronjs");
  }
  console.log("print startbox");
  
});

ipcMain.on('close-canbox', (event, arg) => {
  console.log("close canbox message comming.");
  boxStatus = CanboxStatus.CLOSE;
  canbox.closeBox();
  console.log("print closebox");
  event.reply('close-canbox-complete', "close commplete.");
});



ipcMain.on('netmanager', (event, arg) => {
  if (arg === "start") {
    console.log("start netmanager from react.");
    if (boxStatus !== CanboxStatus.OPEN) {
      event.reply("netmanager-reply", "not start");
    }
    canbox.sendInfoLoop(nativeCallback);
  } else {
    canbox.stopSendInfoLoop();
    console.log("stop netmanager from react.");
  }
});