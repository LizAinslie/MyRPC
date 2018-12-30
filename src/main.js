'use strict';

/* eslint-disable no-console */

const { app, Tray, Menu, BrowserWindow, nativeImage, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const url = require('url');
const rpc = require('discord-rich-presence')('528735337015410712');
const AppUpdater = require('./modules/AppUpdater');

const startTimestamp = new Date();
const rpcData = {
	startTimestamp,
	instance: true,
	details: 'Using MyRPC',
	state: 'Being totally awesome',
	largeImageText: 'MyRPC',
	smallImageText: 'Made by RailRunner16',
	largeImageKey: 'large_default',
	smallImageKey: 'small_default'
}

let needsUpdate = false;
const updater = new AppUpdater('info');

let endUpdateData = null;

let mainWindow;
let tray = null;

const createWindow = () => {
	mainWindow = new BrowserWindow({
		width: 1200,
		height: 1000,
		resizable: true,
		titleBarStyle: 'hidden',
	});

	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'public/index.html'),
		protocol: 'file:',
		slashes: true,
	}));

	const icon = nativeImage.createFromPath(path.join(__dirname, 'assets/logo_square_512.png'));
	if (process.platform != 'darwin') {
		mainWindow.setIcon(icon);
	}

	mainWindow.on('close', event => {
		event.preventDefault();
		mainWindow.hide();
	});

	tray = new Tray(icon);

	const contextMenu = Menu.buildFromTemplate([
		{
			label: 'Support Server',
			click() {
				require('electron').shell.openExternal('https://discord.gg/xna9NRh');
			},
			icon: nativeImage.createFromPath(path.join(__dirname, 'assets/Discord-Logo-Black.png')).resize({ width: 18, height: 18, quality: 'best' })
		},
		
		{
			label: 'Source Code',
			click() {
				require('electron').shell.openExternal('https://github.com/RailRunner166/MyRPC');
			},
			icon: nativeImage.createFromPath(path.join(__dirname, 'assets/Github-Logo-Black.png')).resize({width: 18, height: 18, quality: 'best'})
		},
		{
			label: 'Website',
			click() {
				require('electron').shell.openExternal('http://myrpc.railrunner16.me/');
			},
			icon: nativeImage.createFromPath(path.join(__dirname, 'assets/Globe-Button-Black.png')).resize({ width: 18, height: 18, quality: 'best' })
		},
		{
			label: 'Exit MyRPC',
			click() { 
				app.exit()
			},
			icon: nativeImage.createFromPath(path.join(__dirname, 'assets/Close-Me-Button-Black.png')).resize({width: 18, height: 18, quality: 'best'})
		}	
	]);

	tray.setToolTip('MyRPC');

	tray.setContextMenu(contextMenu);

	tray.on('click', () => {
		mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
	});
}

const setActivity = data => {
	if (!rpc || !mainWindow) {
		return;
	}

	return rpc.updatePresence(data);
}

app.on('ready', () => {
	createWindow()
	app.setName('MyRPC')

	globalShortcut.register('CommandOrControl+Shift+I', () => {
		mainWindow.webContents.openDevTools();
	});

	updater.check();

	setActivity(rpcData);
});


app.on('window-all-closed', () => {
	app.quit();
});

app.on('activate', () => {
	if (mainWindow === null) {
		createWindow();
	}
});

ipcMain.on('asynchronous-message', (e, data) => {
	rpcData.details = data.details;
	rpcData.state = data.state;
	rpcData.largeImageText = data.largeImageText;
	rpcData.smallImageText = data.smallImageText;
	rpcData.largeImageKey = data.largeImageKey;
	rpcData.smallImageKey = data.smallImageKey;

	//the fuck is this? debug mode isn't on!
	//console.debug(rpcData);

	setActivity(rpcData);
})

ipcMain.on('synchronous-message', (e, action) => {
	switch (action.toLowerCase()) {
		case 'get_time':
		    e.returnValue = startTimestamp;
	}
});

process.on('unhandledRejection', console.error);
