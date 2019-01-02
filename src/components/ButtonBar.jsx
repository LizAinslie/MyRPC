import React from 'react';
import PropTypes from 'prop-types';

class ButtonBar extends React.Component {
	render() {
		return (
			<div className="ui btn bar">
				{this.props.buttons.map((btn, i) => (
					<button key={i} className="button" onClick={btn.bind ? btn.action.bind(this) : btn.action}>{btn.text}</button>
				))}
			</div>
		);
	}
}

ButtonBar.propTyps = {
	buttons: PropTypes.arrayOf(PropTypes.shape({
		name: PropTypes.string.isRequired,
		action: PropTypes.func.isRequired,
		bind: PropTypes.bool.isRequired
	})).isRequired
};

export default ButtonBar;
