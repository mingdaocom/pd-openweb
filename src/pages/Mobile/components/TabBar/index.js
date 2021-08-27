import React, { Fragment, Component } from 'react';
import { withRouter } from 'react-router-dom';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import './index.less';
import 'src/pages/Mobile/MyHome/index.less';

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
          className={cx('itemTab', {action: action === 'appHome'})}
          onClick={() => {
            history.push('/mobile/appHome');
          }}
        >
          <Icon icon="workbench"/>
          <span>{_l('首页')}</span>
        </div>
        {!md.global.SysSettings.hideTemplateLibrary && (
          <div
            className={cx('itemTab', {action: action === 'appBox'})}
            onClick={() => {
              history.push('/mobile/appBox');
            }}
          >
            <Icon icon="application_library"/>
            <span>{_l('应用库')}</span>
          </div>
        )}
        <div
          className={cx('itemTab', {action: action === 'myHome'})}
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
