import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import AppWarehouse from 'src/pages/AppHomepage/AppLib';
import './index.less';

let AddBox = class AddBox extends Component {
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
          {window.platformENV.isOverseas || window.platformENV.isLocal ? (
            <AppWarehouse />
          ) : (
            <iframe
              src={`${md.global.Config.MarketUrl}/apps`}
              className="w100 h100"
              style={{
                border: 'none',
              }}
            />
          )}
        </div>
      </div>
    );
  }
};
AddBox = withRouter(AddBox);
export default AddBox;
