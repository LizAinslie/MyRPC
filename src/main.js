'use strict';

/* eslint-disable no-console */

const { app, BrowserWindow, nativeImage, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const url = require('url');
const rpc = require('discord-rich-presence')('528735337015410712');

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

let mainWindow;

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
	mainWindow.setIcon(icon);

	mainWindow.on('closed', () => {
		mainWindow = null;
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

	console.debug(rpcData);

	setActivity(rpcData);
})

ipcMain.on('synchronous-message', (e, action) => {
	switch (action.toLowerCase()) {
		case 'get_time':
		    e.returnValue = startTimestamp;
	}
});

process.on('unhandledRejection', console.error);
