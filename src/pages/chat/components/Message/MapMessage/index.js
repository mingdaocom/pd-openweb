import React, { Component } from 'react';
import Amap from 'ming-ui/components/amap/Amap';
import './index.less';

export default class MapMessage extends Component {
  constructor(props) {
    super(props);
  }
  handleOpenMap() {
    const { location } = this.props.message;
    window.open(`http://gaode.com/search?query=${location.title}`);
  }
  render() {
    const { location } = this.props.message;
    const param = {
      zoom: 20,
      center: [location.lng, location.lat],
    };
    return (
      <div className="Message-card Message-cardMap">
        <div className="Message-cardMap-wrapper">
          <Amap mapOptions={param} mapTools={false} mapSearch={false} />
        </div>
        <div className="Message-cardMap-content" onClick={this.handleOpenMap.bind(this)}>
          <div className="title">{location.title}</div>
          <div className="address">{location.address}</div>
        </div>
      </div>
    );
  }
}
