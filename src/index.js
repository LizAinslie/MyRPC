import { app, Tray, Menu, BrowserWindow, nativeImage, ipcMain, globalShortcut, shell } from 'electron';
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import { enableLiveReload } from 'electron-compile';
import Analytics from 'electron-google-analytics';
import AutoLaunch from 'auto-launch';
import * as path from 'path';
import * as url from 'url';
import rpc from 'discord-rich-presence';
import * as fs from 'fs';

if(require('electron-squirrel-startup')) app.quit();

class RpcApp {
	constructor() {
		this.debug = process.execPath.match(/[\\/]electron/);

		this.conf = null;
		this.rpcData = null;
		this.autoLaunch = null;
		this.analytics = null;
		this.analyticsClientId = null;
		this.clientId = null;
		this.rpc = null;
		this.settingsLocation = null;

		this.initConfig();
		this.initRpcClient();
		this.initAnalytics();

		if (this.debug) enableLiveReload({ strategy: 'react-hmr' });

		this.initRpcData();

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

	logger(e) {
		if(this.debug) console.log(e);
	}

	initAutoLaunch() {
		this.autoLaunch = new AutoLaunch({
			name: 'MyRPC',
		});

		this.autoLaunch.enable();
	}

	toggleAutoLaunch() {
		this.autoLaunch.isEnabled().then(enabled => {
			if (enabled) {
				this.autoLaunch.disable();
				return false;
			} else {
				this.autoLaunch.enable();
				return true;
			}
		});
	}

	initAnalytics() {
		this.analytics = new Analytics('UA-131558223-1');
		this.analyticsClientId = null;
	}

	initRpcClient() {
		this.clientId = this.conf.get('client:id');
		this.logger(this.clientId);
		this.rpc = rpc(this.clientId);
	}

	initRpcData() {
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
			
			this.conf.set('rpc:data', this.rpcData);
			this.conf.save(e => this.logger(e));
		}
	}

	initConfig() {
		this.conf = require('nconf');
		this.settingsLocation = path.join(app.getPath('documents'), 'MyRPC.conf.json');
		
		this.logger(this.settingsLocation);

		if (fs.existsSync(this.settingsLocation)) {
			this.conf.file({ file: this.settingsLocation });
		} else {
			fs.writeFileSync(this.settingsLocation, JSON.stringify({client: {id: '528735337015410712'}}));
			this.logger('File is created successfully.');
			this.conf.file({ file: this.settingsLocation });
		}
	}

	loadMenuIcon(name) {
		return nativeImage.createFromPath(path.join(__dirname, `assets/menu_icons/${name}.png`)).resize({ width: 18, height: 18, quality: 'best' });
	}

	loadIcons() {
		const postfix = process.platform === 'darwin' ? 'mac' : 'windows';
		this.icons.update = this.loadMenuIcon(`download_${postfix}`);
		this.icons.github = this.loadMenuIcon(`github_${postfix}`);
		this.icons.discord = this.loadMenuIcon(`discord_${postfix}`);
		this.icons.globe = this.loadMenuIcon(`globe_${postfix}`);
		this.icons.close = this.loadMenuIcon(`close_${postfix}`);
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

		if (this.debug) await installExtension(REACT_DEVELOPER_TOOLS);

		if (process.platform !== 'darwin') this.mainWindow.setIcon(this.icon);

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
			this.rpcData.startTimestamp = data.startTimestamp || +new Date();

			this.logger(data.appId);
			this.logger(this.clientId);

			if (this.clientId === data.appId) {
				this.setActivity(this.rpcData);
			} else {
				this.conf.set('client:id', data.appId);
				this.conf.save(e => this.logger(e));
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

		app.on('window-all-closed', app.quit);

		app.on('activate', () => {
			if (this.mainWindow === null) this.createWindow();
		});
	}

	setActivity(data) {
		if (!this.rpc || !this.mainWindow) return;

		this.conf.set('rpc:data', data);
		this.conf.save(e => this.logger(e));
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
