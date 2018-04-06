const electron = require('electron');
const {
    app,
    BrowserWindow,
    ipcMain
} = electron;
var mainWindow = null;
var session = require('./nicoSession');
const nicoComment = require('./nicoComment')
var socket = null;
var alert = null;
var live = null;
app.on('window-all-closed', () => {
    if (process.platform != 'darwin') {
        app.quit();
    }
})
app.disableHardwareAcceleration()
app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        resizable: false,
    })
    mainWindow.loadURL('file://' + __dirname + '/static/index.html')
    mainWindow.on('closed', () => {
        mainWindow = null;
    })
    session().then((session) => {
        ipcMain.on('setlive', function(ev, data) {
            if (socket != null) {
                socket.end()
                socket = null
            }
            if (alert != null) {
                alert.end()
                alert = null;
            }
            live = ev;
            nicoComment.fetchThread(session, data).then(thread => {
                mainWindow.webContents.send('title', thread.title);
                nicoComment.getviewer(thread).then(viewer => {
                    socket = viewer;
                    socket.on('data', function(data) {
                        mainWindow.webContents.send('message', data);
                    })
                })
                return nicoComment.getliveInfo(session, data);
            }).then(data => {
                mainWindow.webContents.send('livedata', data)
            })
        })
    })
})