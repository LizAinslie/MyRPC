import React from 'react';
import ReactDOM from 'react-dom';
import { ipcRenderer } from 'electron';

import Column from './components/Column';
import Grid from './components/Grid';
import Preview from './components/Preview';
import Header from './components/Header';

const Store = require('electron-store');
const store = new Store();

const time = ipcRenderer.sendSync('synchronous-message', 'get_time');

export default class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			data: {
				details: 'Using MyRPC',
				state: 'Being totally awesome',
				largeImageText: 'MyRPC',
				smallImageText: 'Made by RailRunner16',
				largeImageKey: 'large_default',
				smallImageKey: 'small_default',
				startTime: time,
				appId: store.get('clientId')
			},
			images: null,
		};

		this.updateData = this.updateData.bind(this);
	}

	updateData(e) {
		const data = this.state.data;

		data[e.target.name] = e.target.value;

		this.setState({
			data
		});
	}

	async componentWillMount() {
		const resp = await fetch('http://165.227.63.75:3500/images');
		const body = await resp.json();

		this.setState({
			images: body
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
								<input type="text" name="details" onChange={this.updateData} value={this.state.data.details}/>
							</div>
							<div className="input">
								<label htmlFor="state">State</label>
								<input type="text" name="state" onChange={this.updateData} value={this.state.data.state}/>
							</div>
							<div className="input">
								<label htmlFor="largeImageText">Large Image Text</label>
								<input type="text" name="largeImageText" onChange={this.updateData} value={this.state.data.largeImageText}/>
							</div>
							<div className="input">
								<label htmlFor="smallImageText">Small Image Text</label>
								<input type="text" name="smallImageText" onChange={this.updateData} value={this.state.data.smallImageText}/>
							</div>
							<div className="input">
								<label htmlFor="largeImageKey">Large Image Key</label>
								<input type="text" name="largeImageKey" onChange={this.updateData} />
							</div>
							<div className="input">
								<label htmlFor="smallImageKey">Small Image</label>
								<input type="text" name="smallImageKey" onChange={this.updateData} />
							</div>
							<div className="input">
								<label htmlFor="appId">Discord App ID (restart required on change)</label>
								<input type="text" name="appId" onChange={this.updateData} value={this.state.data.appId}/>
							</div>


							<button onClick={() => ipcRenderer.send('asynchronous-message', this.state.data)}>Make it So!</button>
						</div>
					</Column>
					<Column>
						<Preview {...this.state.data} />
					</Column>
				</Grid>
			</div>
		);
	}
};
