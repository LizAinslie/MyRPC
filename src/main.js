const { app, Tray, Menu, BrowserWindow, nativeImage, ipcMain, globalShortcut, shell } = require('electron');
const path = require('path');
const url = require('url');
const Analytics = require('electron-google-analytics');

const AppUpdater = require('./modules/AppUpdater');
const ManualUpdater = require('./modules/ManualUpdater');

class App {
	constructor(debug) {
		this.analytics = new Analytics.default('UA-131558223-1');
		this.rpc = require('discord-rich-presence')('528735337015410712');
		this.updater = new AppUpdater('info');

		this.analyticsClientId = null;
		this.debug = !!debug;

		this.startTimestamp = new Date();
		this.rpcData = {
			startTimestamp: this.startTimestamp,
			instance: true,
			details: 'Using MyRPC',
			state: 'Being totally awesome',
			largeImageText: 'MyRPC',
			smallImageText: 'Made by RailRunner16',
			largeImageKey: 'large_default',
			smallImageKey: 'small_default'
		};

		this.icons = {};
		
		this.tray = null;
		this.mainWindow = null;
		this.icon = nativeImage.createFromPath(path.join(__dirname, 'assets/logo_square_512.png'));

		this.loadIcons();
		this.initAppEvents();
		this.initIpcEvents();

		this.buildMenu();

		this.getGAClientId();
	}

	loadMenuIcon(name) {
		return nativeImage.createFromPath(path.join(__dirname, `assets/menu_icons/${name}.png`)).resize({width: 18, height: 18, quality: 'best'})
	}

	loadIcons() {
		this.icons.update = process.platform === 'darwin' ? this.loadMenuIcon('download_mac') : this.loadMenuIcon('download_windows');
		this.icons.github = process.platform === 'darwin' ? this.loadMenuIcon('github_mac') : this.loadMenuIcon('github_windows');
		this.icons.discord = process.platform === 'darwin' ? this.loadMenuIcon('discord_mac') : this.loadMenuIcon('discord_windows');
		this.icons.globe = process.platform === 'darwin' ? this.loadMenuIcon('globe_mac') : this.loadMenuIcon('globe_windows');
		this.icons.close = process.platform === 'darwin' ? this.loadMenuIcon('close_mac') : this.loadMenuIcon('close_windows');
	}

	createWindow() {
		this.mainWindow = new BrowserWindow({
			width: 1200,
			height: 1000,
			resizable: true,
			titleBarStyle: 'hidden',
		});
	
		this.mainWindow.loadURL(url.format({
			pathname: path.join(__dirname, 'public/index.html'),
			protocol: 'file:',
			slashes: true,
		}));

		if (process.platform != 'darwin') {
			this.mainWindow.setIcon(this.icon);
		}
	
		this.mainWindow.on('close', event => {
			event.preventDefault();
			this.mainWindow.hide();
		});
	}

	initIpcEvents() {
		ipcMain.on('asynchronous-message', (e, data) => {
			this.rpcData.details = data.details;
			this.rpcData.state = data.state;
			this.rpcData.largeImageText = data.largeImageText;
			this.rpcData.smallImageText = data.smallImageText;
			this.rpcData.largeImageKey = data.largeImageKey;
			this.rpcData.smallImageKey = data.smallImageKey;
		
			//the fuck is this? debug mode isn't on!
			//console.debug(rpcData);
		
			this.setActivity(this.rpcData);
		});
		
		ipcMain.on('synchronous-message', (e, action) => {
			switch (action.toLowerCase()) {
			case 'get_time':
				e.returnValue = this.startTimestamp;
			}
		});
	}

	async getGAClientId() {
		const response = await this.analytics.screen('myrpc', app.getVersion(), 'me.railrunner16.myrpc', 'me.railrunner16.myrpc', 'Main');
		this.analyticsClientId = response.clientId;
	}

	initAppEvents() {
		app.on('ready', () => {
			this.buildTray();
			this.createWindow();
			app.setName('MyRPC');
		
			globalShortcut.register('CommandOrControl+Shift+I', () => {
				this.mainWindow.webContents.openDevTools();
			});
		
			this.updater.check();
		
			this.setActivity(this.rpcData);
		});

		app.on('window-all-closed', () => {
			app.quit();
		});
		
		app.on('activate', () => {
			if (this.mainWindow === null) {
				this.createWindow();
			}
		});
	}

	setActivity(data) {
		if (!this.rpc || !this.mainWindow) {
			return;
		}
	
		return this.rpc.updatePresence(data);
	}

	buildMenu() {
		const windowMenu = Menu.buildFromTemplate([
			{
				label: 'Links',
				submenu: [
					{
						label: 'Support Server',
						click() {
							this.analytics.pageview('https://discord.gg', '/xna9NRh', 'Support Server Invite', this.analyticsClientId).then(() => {
								shell.openExternal('https://discord.gg/xna9NRh');
							});
						},
						icon: this.icons.discord
					},
					
					{
						label: 'Source Code',
						click() {
							this.analytics.pageview('https://github.com', '/RailRunner166/MyRPC', 'GitHub Page', this.analyticsClientId).then(() => {
								shell.openExternal('https://github.com/RailRunner166/MyRPC');
							});
						},
						icon: this.icons.github
					},
					{
						label: 'Website',
						click() {
							this.analytics.pageview('https://railrunner16.me', '/myrpc', 'Product Website', this.analyticsClientId).then(() => {
								shell.openExternal('https://railrunner16.me/myrpc');
							});
						},
						icon: this.icons.globe
					}
				]
			},
			{
				label: 'Actions',
				submenu: [
					{
						label: 'Exit MyRPC',
						click() { 
							app.exit();
						},
						icon: this.icons.close
					},
					{
						label: 'Check for Updates',
						click: ManualUpdater.checkForUpdates,
						icon: this.icons.update
					}
				]
			}
		]);
	
		Menu.setApplicationMenu(windowMenu);
	}

	buildTray() {
		this.tray = new Tray(this.icon);

		const contextMenu = Menu.buildFromTemplate([
			{
				label: 'Support Server',
				click() {
					this.analytics.pageview('https://discord.gg', '/xna9NRh', 'Support Server Invite', this.analyticsClientId).then(() => {
						shell.openExternal('https://discord.gg/xna9NRh');
					});
				},
				icon: this.icons.discord
			},
			
			{
				label: 'Source Code',
				click() {
					this.analytics.pageview('https://github.com', '/RailRunner166/MyRPC', 'GitHub Page', this.analyticsClientId).then(() => {
						shell.openExternal('https://github.com/RailRunner166/MyRPC');
					});
				},
				icon: this.icons.github
			},
			{
				label: 'Website',
				click() {
					this.analytics.pageview('https://railrunner16.me', '/myrpc', 'Product Website', this.analyticsClientId).then(() => {
						shell.openExternal('https://railrunner16.me/myrpc');
					});
				},
				icon: this.icons.globe

			},
			{
				label: 'Exit MyRPC',
				click() { 
					app.exit();
				},
				icon: this.icons.close
			}
		]);

		this.tray.setToolTip('MyRPC');

		this.tray.setContextMenu(contextMenu);

		this.tray.on('click', () => {
			this.mainWindow.isVisible() ? this.mainWindow.hide() : this.mainWindow.show();
		});
	}
}

new App(false);
