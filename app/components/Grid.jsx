import React from 'react';

import './Grid.scss';

class Grid extends React.Component {
	render() {
		return (
			<div className="ui grid">
				{this.props.children}
			</div>
		);
	}
}

export default Grid;
