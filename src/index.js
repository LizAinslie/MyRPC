
import { app, Tray, Menu, BrowserWindow, nativeImage, ipcMain, globalShortcut, shell } from 'electron';
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import { enableLiveReload } from 'electron-compile';
import Analytics from 'electron-google-analytics';
import * as path from 'path';
import * as url from 'url';
import rpc from 'discord-rich-presence';
import * as fs from 'fs';
if(require('electron-squirrel-startup')) app.quit();
class RpcApp {
	constructor() {
		this.conf = require('nconf')
		this.settingsLocation = path.join(app.getPath("documents"), "MyRPC.conf.json")
		console.log(this.settingsLocation) 
		if (fs.existsSync(this.settingsLocation)) {
			this.conf.file({ file: this.settingsLocation })
		} else {
			fs.writeFileSync(this.settingsLocation, JSON.stringify({client: {id: "528735337015410712"}}))
			console.log('File is created successfully.');
			this.conf.file({ file: this.settingsLocation })
		}
		
		this.clientId = this.conf.get('client:id');
		console.log(this.clientId)
		this.rpc = rpc(this.clientId);

		this.analytics = new Analytics('UA-131558223-1');
		this.analyticsClientId = null;

		this.debug = process.execPath.match(/[\\/]electron/);

		if (this.debug) enableLiveReload({ strategy: 'react-hmr' });

		this.startTimestamp = Date.now();

		this.rpcData = this.conf.get('rpc:data');
		if (this.rpcData === undefined) {
			this.rpcData = {
				startTimestamp: this.startTimestamp,
				instance: true,
				details: 'Using MyRPC',
				state: 'Being totally awesome',
				largeImageText: 'MyRPC',
				smallImageText: 'Made by RailRunner16',
				largeImageKey: 'large_default',
				smallImageKey: 'small_default',
			};
			this.conf.set("rpc:data", this.rpcData);
			this.conf.save((e) => console.log(e));
		}
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
		return nativeImage.createFromPath(path.join(__dirname, `assets/menu_icons/${name}.png`)).resize({ width: 18, height: 18, quality: 'best' });
	}

	loadIcons() {
		this.icons.update = process.platform === 'darwin' ? this.loadMenuIcon('download_mac') : this.loadMenuIcon('download_windows');
		this.icons.github = process.platform === 'darwin' ? this.loadMenuIcon('github_mac') : this.loadMenuIcon('github_windows');
		this.icons.discord = process.platform === 'darwin' ? this.loadMenuIcon('discord_mac') : this.loadMenuIcon('discord_windows');
		this.icons.globe = process.platform === 'darwin' ? this.loadMenuIcon('globe_mac') : this.loadMenuIcon('globe_windows');
		this.icons.close = process.platform === 'darwin' ? this.loadMenuIcon('close_mac') : this.loadMenuIcon('close_windows');
	}

	async createWindow() {
		this.mainWindow = new BrowserWindow({
			width: 1200,
			height: 1000,
			resizable: true,
			titleBarStyle: 'hidden',
		});

		this.mainWindow.loadURL(url.format({
			pathname: path.join(__dirname, 'index.html'),
			protocol: 'file:',
			slashes: true,
		}));

		if (this.debug) {
			await installExtension(REACT_DEVELOPER_TOOLS);
		}

		if (process.platform != 'darwin') {
			this.mainWindow.setIcon(this.icon);
		}

		this.mainWindow.on('close', (event) => {
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
			this.rpcData.startTimestamp = data.startTimestamp;

			// console.log(data.appId);
			// console.log(this.clientId);

			if (this.clientId == data.appId) {
				this.setActivity(this.rpcData);
				this.conf.set('rpc:data', this.rpcData);
				this.conf.save((e) => console.log(e));
			} else {
				this.conf.set('client:id', data.appId);
				this.conf.save((e) => console.log(e));
				app.relaunch();
				app.exit(0);
			}
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

		this.conf.set('rpc:data', data);
		this.conf.save((e) => console.log(e));
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
							this.analytics.pageview('https://discord.gg', 'discord.gg/xna9NRh', 'Support Server Invite', this.analyticsClientId).then(() => {
								shell.openExternal('https://discord.gg/xna9NRh');
							});
						},
						icon: this.icons.discord,
					},

					{
						label: 'Source Code',
						click() {
							this.analytics.pageview('https://github.com', 'github.com/RailRunner166/MyRPC', 'GitHub Page', this.analyticsClientId).then(() => {
								shell.openExternal('https://github.com/RailRunner166/MyRPC');
							});
						},
						icon: this.icons.github,
					},
					{
						label: 'Website',
						click() {
							this.analytics.pageview('https://railrunner16.me', 'railrunner16.me/MyRPC', 'Product Website', this.analyticsClientId).then(() => {
								shell.openExternal('https://railrunner16.me/MyRPC');
							});
						},
						icon: this.icons.globe,
					},
				],
			},
			{
				label: 'Actions',
				submenu: [
					{
						label: 'Exit MyRPC',
						click() {
							app.exit();
						},
						icon: this.icons.close,
					},
				],
			},
		]);

		Menu.setApplicationMenu(windowMenu);
	}

	buildTray() {
		this.tray = new Tray(this.icon);

		const contextMenu = Menu.buildFromTemplate([
			{
				label: 'Support Server',
				click() {
					this.analytics.pageview('https://discord.gg', 'discord.gg/xna9NRh', 'Support Server Invite', this.analyticsClientId).then(() => {
						shell.openExternal('https://discord.gg/xna9NRh');
					});
				},
				icon: this.icons.discord,
			},

			{
				label: 'Source Code',
				click() {
					this.analytics.pageview('https://github.com', 'github.com/RailRunner166/MyRPC', 'GitHub Page', this.analyticsClientId).then(() => {
						shell.openExternal('https://github.com/RailRunner166/MyRPC');
					});
				},
				icon: this.icons.github,
			},
			{
				label: 'Website',
				click() {
					this.analytics.pageview('https://railrunner16.me', 'railrunner16.me/MyRPC', 'Product Website', this.analyticsClientId).then(() => {
						shell.openExternal('https://railrunner16.me/MyRPC');
					});
				},
				icon: this.icons.globe,

			},
			{
				label: 'Exit MyRPC',
				click() {
					app.exit();
				},
				icon: this.icons.close,
			},
		]);

		this.tray.setToolTip('MyRPC');

		this.tray.setContextMenu(contextMenu);

		this.tray.on('click', () => {
			this.mainWindow.isVisible() ? this.mainWindow.hide() : this.mainWindow.show();
		});
	}
}

process.on('unhandledRejection', console.log);

new RpcApp();
