import React, { Component } from 'react';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { navigateTo } from 'src/router/navigateTo';
import _ from 'lodash';

const NATIVE_MODULES = [
  { id: 'feed', icon: 'dynamic-empty', text: _l('动态'), color: '#2196f3', href: '/feed', key: 1 },
  { id: 'task', icon: 'task_basic_application', text: _l('任务'), color: '#3cca8f', href: '/apps/task', key: 2 },
  { id: 'calendar', icon: 'sidebar_calendar', text: _l('日程'), color: '#ff6d6c', href: '/apps/calendar/home', key: 3 },
  { id: 'knowledge', icon: 'sidebar_knowledge', text: _l('文件'), color: '#F89803', href: '/apps/kc', key: 4 },
  { id: 'hr', icon: 'hr_home', text: _l('人事'), color: '#607D8B', href: '/hr', key: 5 },
];

export default class NativeModule extends Component {
  static propTypes = {};
  static defaultProps = {};
  constructor(props) {
    super(props);
    this.state = {
      isShow: safeParse(localStorage.getItem('sideNativeModule')),
    };
  }
  switchState = () => {
    this.setState(({ isShow }) => {
      safeLocalStorageSetItem('sideNativeModule', !isShow);
      return {
        isShow: !isShow,
      };
    });
  };

  render() {
    let { isShow } = this.state;
    isShow = isShow === null ? true : isShow;

    _.remove(
      NATIVE_MODULES,
      item =>
        (item.id === 'hr' && !md.global.Account.hrVisible) || md.global.SysSettings.forbidSuites.indexOf(item.key) > -1,
    );

    return (
      <div className="sideAppGroupWrap">
        {NATIVE_MODULES.length ? (
          <div className="sideAppGroupTitleWrap">
            <div className="sideAppGroupTitle">{_l('协作套件')}</div>
            <div className="displayState pointer" onClick={this.switchState}>
              {isShow ? _l('隐藏') : _l('展开')}
            </div>
          </div>
        ) : null}
        <ul className={cx('nativeModuleWrap', { hideGroup: !isShow })}>
          {NATIVE_MODULES.map(({ id, icon, href, text, color }) => (
            <li key={id} onClick={() => navigateTo(href)}>
              <div className="iconWrap" style={{ backgroundColor: color || '#2196f3' }}>
                <Icon icon={icon} className="Font18 White" />
              </div>
              <span className="moduleName overflow_ellipsis">{text}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
