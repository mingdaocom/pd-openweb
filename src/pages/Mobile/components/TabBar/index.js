import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import 'mobile/MyHome/index.less';
import { pathCompletion } from 'src/utils/common';
import './index.less';

let TabBar = class TabBar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { action, history } = this.props;
    return (
      <div className="appTabBar">
        <div
          className={cx('itemTab', {
            action: action === 'appHome',
          })}
          onClick={() => {
            history.push(pathCompletion('/mobile/dashboard', { hasDomain: false }));
          }}
        >
          <Icon icon="home" />
          <span>{_l('工作台')}</span>
        </div>
        <div
          className={cx('itemTab', {
            action: action === 'myHome',
          })}
          onClick={() => {
            history.push(pathCompletion('/mobile/myHome', { hasDomain: false }));
          }}
        >
          <Icon className="Font26" icon="person" />
          <span className="mTop1">{_l('我')}</span>
        </div>
      </div>
    );
  }
};
TabBar = withRouter(TabBar);
export default TabBar;
