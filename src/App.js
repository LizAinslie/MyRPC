import React from 'react';
import { ipcRenderer } from 'electron';

import Column from './components/Column';
import Grid from './components/Grid';
import Preview from './components/Preview';
import Header from './components/Header';
import ButtonBar from './components/ButtonBar';

import * as path from 'path';
import documents from '@myrpc/documents-folder';

import './scss/style.scss';

const time = ipcRenderer.sendSync('synchronous-message', 'get_time');
const settingsPath = path.join(documents(), 'MyRPC.conf.json');
const nconf = require('nconf').file({ file: settingsPath });

export default class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.state.data = nconf.get('rpc:data');
		this.state.data.appId = nconf.get('client:id');
		if (this.state.data === undefined) {
			this.state.data = {
				startTimestamp: time,
				details: 'Using MyRPC',
				state: 'Being totally awesome',
				largeImageText: 'MyRPC',
				smallImageText: 'Made by RailRunner16',
				largeImageKey: 'large_default',
				smallImageKey: 'small_default',
				appId: nconf.get('client:id')
			};
		}
		this.updateData = this.updateData.bind(this);
	}

	updateData(e) {
		const { data } = this.state;

		data[e.target.name] = e.target.value;

		this.setState({
			data,
		});
	}
	
	setStartTimestampToCurrentTime() {
		const { data } = this.state;

		data.startTimestamp = Date.now();

		this.setState({
			data,
		});
	}

	async componentWillMount() {
		const resp = await fetch('http://165.227.63.75:3500/images');
		const body = await resp.json();

		this.setState({
			images: body,
		});
	}

	render() {
		return (
			<div>
				<Header title="MyRPC" subtitle="Easily set your Discord status to anything!" />
				<Grid>
					<Column>
						<div className="ui form">
							<div className="input">
								<label htmlFor="details">Details</label>
								<input type="text" name="details" onChange={this.updateData} value={this.state.data.details} />
							</div>
							<div className="input">
								<label htmlFor="state">State</label>
								<input type="text" name="state" onChange={this.updateData} value={this.state.data.state} />
							</div>
							<div className="input">
								<label htmlFor="largeImageText">Large Image Text</label>
								<input type="text" name="largeImageText" onChange={this.updateData} value={this.state.data.largeImageText} />
							</div>
							<div className="input">
								<label htmlFor="smallImageText">Small Image Text</label>
								<input type="text" name="smallImageText" onChange={this.updateData} value={this.state.data.smallImageText} />
							</div>
							<div className="input">
								<label htmlFor="largeImageKey">Large Image Key</label>
								<input type="text" name="largeImageKey" onChange={this.updateData} value={this.state.data.largeImageKey} />
							</div>
							<div className="input">
								<label htmlFor="smallImageKey">Small Image</label>
								<input type="text" name="smallImageKey" onChange={this.updateData} value={this.state.data.smallImageKey} />
							</div>
							<div className="input">
								<label htmlFor="appId">Discord App ID (restart required on change)</label>
								<input type="text" name="appId" onChange={this.updateData} value={this.state.data.appId} />
							</div>


							<button className="button" onClick={() => ipcRenderer.send('asynchronous-message', this.state.data)}>Make it So!</button>
						</div>
					</Column>
					<Column>
						<Preview {...this.state.data} />

						<hr className="ui spacer" />
						
						<ButtonBar buttons={[
							{
								text: 'Refresh Timestamp',
								action: this.setStartTimestampToCurrentTime.bind(this),
								bind: false
							}
						]} />
					</Column>
				</Grid>
			</div>
		);
	}
}
