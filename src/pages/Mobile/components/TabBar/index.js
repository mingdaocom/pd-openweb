import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import 'mobile/MyHome/index.less';
import './index.less';

@withRouter
export default class TabBar extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { action, history } = this.props;
    return (
      <div className="appTabBar">
        <div
          className={cx('itemTab', { action: action === 'appHome' })}
          onClick={() => {
            history.push('/mobile/dashboard');
          }}
        >
          <Icon icon="home" />
          <span>{_l('工作台')}</span>
        </div>
        {!md.global.SysSettings.hideTemplateLibrary && (
          <div
            className={cx('itemTab', { action: action === 'appBox' })}
            onClick={() => {
              history.push('/mobile/appBox');
            }}
          >
            {md.global.Config.IsLocal ? (
              <Fragment>
                <Icon icon="application_library" />
                <span>{_l('应用库')}</span>
              </Fragment>
            ) : (
              <Fragment>
                <Icon icon="merchant" />
                <span>{_l('市场')}</span>
              </Fragment>
            )}
          </div>
        )}
        <div
          className={cx('itemTab', { action: action === 'myHome' })}
          onClick={() => {
            history.push('/mobile/myHome');
          }}
        >
          <Icon className="Font26" icon="person" />
          <span className="mTop1">{_l('我')}</span>
        </div>
      </div>
    );
  }
}
