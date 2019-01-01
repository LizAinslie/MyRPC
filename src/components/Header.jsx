import React from 'react';
import PropTypes from 'prop-types';

class Header extends React.Component {
    render() {
        return (
            <h1 className="ui header">
                {this.props.title}
                <span className="sub header">{this.props.subtitle}</span>
            </h1>
        );
    }
}

Header.propTypes = {
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired,
};

export default Header;