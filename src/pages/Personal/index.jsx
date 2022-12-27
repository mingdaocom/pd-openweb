import React, { Component } from 'react';
import cx from 'classnames';
import Loadable from 'react-loadable';
import { navigateTo } from 'src/router/navigateTo';
import common from './common.js';
import './index.less';
import { getRequest } from 'src/util';
import _ from 'lodash';

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
    const defaultType = type[0]
    navigateTo(common.url({ type: defaultType }));
  }

  render() {
    const menus = common.MENULEFT;
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
        <div id="accountNav" className="Relative">
          <div className="ThemeBG leftNavHairGlass" />
          <div className="h100 ThemeBGColor9">
            <ul className="accountTab">
              {menus &&
                menus.map(item => {
                  return (
                    <li
                      className={cx('ThemeHoverBGColor7 Hand Relative', { active: item.typetag.includes(type) })}
                      key={item.typetag}
                      onClick={() => this.handleClick(item.typetag)}
                    >
                      <span className={cx('Font20 pRight15 Gray_9e', item.icon)} />
                      {item.title}
                      {item.typetag === 'account' && showWarn && type !== 'account' && (
                        <span className="warnLight warnLightMyaccount" />
                      )}
                    </li>
                  );
                })}
            </ul>
          </div>
        </div>
        <div id="accountCenterMainBox" className="mainPage">
          <MainComponent />
        </div>
      </div>
    );
  }
}
