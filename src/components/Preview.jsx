import React from 'react';
import Moment from 'react-moment';
import PropTypes from 'prop-types';

class Preview extends React.Component {
	constructor(props) {
		super(props);

		this.images = {};

		fetch('http://165.227.63.75:3500/images')
			.then(resp => resp.json())
			.then(body => {
				for (const item of body) {
					this.images[item.id] = item.url;
				}
			});
	}

	render() {
		return (
			<div className="ui preview">
				<div className="images">
					<img className="big image" title={this.props.largeImageText} src={this.images[this.props.largeImageKey]} />
					<img className="small image" title={this.props.smallImageText} src={this.images[this.props.smallImageKey]} />
				</div>
				<div className="info">
					<span className="text row name">MyRPC</span>
					<span className="text row">{this.props.details}</span>
					<span className="text row">{this.props.state}</span>
					<span className="text row"><Moment fromNow ago>{this.props.startTime}</Moment> elapsed</span>
				</div>
			</div>
		);
	}
}

Preview.propTypes = {
	startTimestamp: PropTypes.number.isRequired,
	smallImageKey: PropTypes.string.isRequired,
	largeImageKey: PropTypes.string.isRequired,
	smallImageText: PropTypes.string.isRequired,
	largeImageText: PropTypes.string.isRequired,
	state: PropTypes.string.isRequired,
	details: PropTypes.string.isRequired,
};

export default Preview;
