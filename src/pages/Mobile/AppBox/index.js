import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import AppWarehouse from 'src/pages/AppHomepage/AppLib';
import TabBar from '../components/TabBar';
import './index.less';

@withRouter
export default class AddBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loading: true,
    };
  }

  render() {
    return (
      <div className="appBox h100">
        <div className="content">
          {md.global.Config.IsLocal ? (
            <AppWarehouse />
          ) : (
            <iframe src={`${md.global.Config.MarketUrl}/apps`} className="w100 h100" style={{ border: 'none' }} />
          )}
        </div>
        <TabBar action="appBox" />
      </div>
    );
  }
}
