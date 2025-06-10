import React, { Component } from 'react';
import Loadable from 'react-loadable';
import cx from 'classnames';
import _ from 'lodash';
import { navigateTo } from 'src/router/navigateTo';
import { getRequest } from 'src/utils/common';
import common from './common.js';
import { routerConfigs } from './routerConfig.js';
import './index.less';

const guideSettings = md.global.Account.guideSettings;
const showWarn = guideSettings.accountEmail || guideSettings.accountMobilePhone;

export default class PersonalEntrypoint extends Component {
  componentDidMount() {
    $('html').addClass('AppPersonal');
  }
  componentWillUnmount() {
    $('html').removeClass('AppPersonal');
  }
  shouldComponentUpdate(nextProps) {
    if (nextProps.location.search !== this.props.location.search) {
      return true;
    }
    return false;
  }

  handleClick(type) {
    const defaultType = type[0];
    navigateTo(common.url({ type: defaultType }));
  }

  render() {
    const menus =
      !md.global.Config.IsLocal || (md.global.Config.IsLocal && md.global.Config.ShowLicense)
        ? routerConfigs
        : routerConfigs.slice(0, -1);
    const type = getRequest().type || 'information';
    const currentComp = _.get(
      _.find(menus, menu => menu.typetag.includes(type)),
      'component',
    );
    const MainComponent = Loadable({
      loader: currentComp,
      loading: () => null,
    });
    return (
      <div className="mainBoxAccount">
        <div className="h100 ThemeBGColor9 accountTabWrap">
          <ul className="accountTab">
            {menus &&
              menus.map((item, index) => {
                return (
                  <li
                    className={cx('ThemeHoverBGColor7 Hand Relative', { active: item.typetag.includes(type) })}
                    key={index}
                    onClick={() => this.handleClick(item.typetag)}
                  >
                    <span className={cx('Font20 pRight15 Gray_9e', item.icon)} />
                    {item.title}
                    {item.typetag.includes('account') && showWarn && type !== 'account' && (
                      <span className="warnLight warnLightMyaccount" />
                    )}
                  </li>
                );
              })}
          </ul>
        </div>
        <div id="accountCenterMainBox" className="mainPage flex">
          <MainComponent />
        </div>
      </div>
    );
  }
}
