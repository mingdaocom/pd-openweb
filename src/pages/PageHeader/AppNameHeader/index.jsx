import React, { Component } from 'react';
import api from 'api/homeApp';
import './index.less';
import { navigateTo } from '../../../router/navigateTo';
import { SvgIcon } from 'ming-ui';

export default class AppNameHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      appId: '',
      data: null,
      icon: '',
      name: '',
      iconColor: '',
    };
  }

  componentDidMount() {
    api.getApp({ appId: this.props.match.params.apkId }, { silent: true }).then(data => {
      this.setState({
        data: data,
        iconUrl: data.iconUrl,
        name: data.name,
        iconColor: data.iconColor,
      });
    });
  }

  render() {
    const { iconUrl, name, iconColor } = this.state;
    return (
      <div className="appNameHeaderBox">
        {this.state.data && (
          <React.Fragment>
            <div className="appIconWrap">
              <span
                className="appIconWrapIcon"
                style={{
                  backgroundColor: iconColor,
                }}
                onClick={() => {
                  navigateTo(`/app/${this.props.match.params.apkId}`);
                }}>
                <SvgIcon url={iconUrl} fill="#fff" size={24} />
              </span>
            </div>
            <div
              className="appName Gray Font16 Hand"
              onClick={() => {
                navigateTo(`/app/${this.props.match.params.apkId}`);
              }}>
              {name}
            </div>
          </React.Fragment>
        )}
      </div>
    );
  }
}
