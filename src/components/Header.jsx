import React from 'react';
import PropTypes from 'prop-types';

class Header extends React.Component {
    render() {
        return (
            <h1 class="ui header">
                {this.props.title}
                <span class="sub header">{this.props.subtitle}</span>
            </h1>
        );
    }
}

Header.propTypes = {
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired,
};

export default Header;