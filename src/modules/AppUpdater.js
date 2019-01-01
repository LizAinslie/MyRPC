const { autoUpdater } = require('electron-updater');

class AppUpdater {
	constructor(logLevel) {
		this.updater = autoUpdater;

		const log = require('electron-log');
		log.transports.file.level = logLevel || 'debug';
		this.updater.logger = log;
	}

	check() {
		return this.updater.checkForUpdatesAndNotify();
	}

	download(token) {
		return this.updater.downloadUpdate(token);
	}
}

module.exports = AppUpdater;