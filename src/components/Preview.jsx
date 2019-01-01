import React from 'react';
import Moment from 'react-moment';

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
                    <img className="big image" alt={this.props.largeImageText} title={this.props.largeImageText} src={this.images[this.props.largeImageKey]} />
                    <img className="small image" alt={this.props.smallImageText} title={this.props.smallImageText} src={this.images[this.props.smallImageKey]} />
                </div>
                <div className="info">
                    <span className="text row name">MyRPC</span>
                    <span className="text row">{this.props.details}</span>
                    <span className="text row">{this.props.state}</span>
                    <span className="text row"><Moment fromNow>{this.props.startTime}</Moment> elapsed</span>
                </div>
            </div>
        );
    }
}

export default Preview;
