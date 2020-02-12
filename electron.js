const { app, BrowserWindow } = require('electron')
const path = require('path');
const url = require('url')
const pkg = require('../package.json')


function createWindow () {
  // Create the browser window.
  let win = new BrowserWindow({
    width: 800,
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