import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import cx from 'classnames';
import _ from 'lodash';
import { compile, pathToRegexp } from 'path-to-regexp';
import Trigger from 'rc-trigger';
import { MdLink, UpgradeIcon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { navigateTo } from 'src/router/navigateTo';
import { VersionProductType } from 'src/utils/enum';
import { getCurrentProject, getFeatureStatus } from 'src/utils/project';
import './index.less';

@withRouter
export default class AdminLeftMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentCompanyName: '',
      isExtend: this.props.isExtend,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { projectId },
      },
      location: { pathname },
      menuList,
    } = this.props;

    const currentProject = getCurrentProject(projectId, true);

    this.setState({
      currentCompanyName: currentProject.companyName,
    });

    const nav = _.find(menuList, item =>
      _.some(item.subMenuList, it => _.some(it.routes, ({ path }) => pathToRegexp(path).test(pathname))),
    );
    if (pathname.indexOf('home') > -1) {
      this.setState({ userExpand: true });
    }
    if (pathname.indexOf('home') === -1 && !_.isEmpty(nav)) {
      this.setState({ [`${nav.key}Expand`]: true });
    }
  }

  componentWillReceiveProps(nextProps) {
    const {
      location: { pathname },
      menuList,
    } = nextProps;
    const nav = _.find(menuList, item =>
      _.some(item.subMenuList, it => _.some(it.routes, ({ path }) => pathToRegexp(path).test(pathname))),
    );
    if (pathname.indexOf('home') === -1 && !_.isEmpty(nav)) {
      this.setState({ [`${nav.key}Expand`]: true });
    }
  }

  renderLinkItem = ({ icon, name, menuPath, routes, featureId, key, hasBeta = false, featureIds }) => {
    const { subListVisible, isExtend } = this.state;
    const {
      location: { pathname },
      match: {
        params: { projectId },
      },
    } = this.props;
    if (key === 'billinfo' && !md.global.Config.IsPlatformLocal) return;
    if (key === 'weixin' && md.global.SysSettings.hideWeixin) return;
    if (
      key === 'platformintegration' &&
      md.global.SysSettings.hideWorkWeixin &&
      md.global.SysSettings.hideDingding &&
      md.global.SysSettings.hideFeishu &&
      md.global.SysSettings.hideWelink
    )
      return;

    const isActive = () => {
      return _.some(routes, route => pathToRegexp(route.path).test(pathname));
    };
    let routeIndex = undefined;
    let featureType = getFeatureStatus(projectId, featureId);
    if (featureIds) {
      featureIds.forEach((l, i) => {
        let itemFeatureType = getFeatureStatus(projectId, l);
        if (itemFeatureType) {
          routeIndex === undefined && (routeIndex = i);
          featureType = featureType ? Math.min(itemFeatureType, featureType).toString() : itemFeatureType;
        }
      });
    }
    const route = routes[routeIndex || 0] || {};
    const toPath = compile(menuPath || route.path);
    const path =
      route.path && route.path.indexOf(':projectId') === -1 ? toPath({ 0: projectId }) : toPath({ projectId });
    const isHome = key === 'home';

    const platIntegrationUpgrade = _.every(
      [
        VersionProductType.workwxIntergration,
        VersionProductType.dingIntergration,
        VersionProductType.feishuIntergration,
        VersionProductType.WelinkIntergration,
      ],
      item => getFeatureStatus(projectId, item) === '2',
    );

    const licenseType = (md.global.Account.projects.find(o => o.projectId === projectId) || {}).licenseType;
    const isFreeUpgrade = licenseType === 0 && _.includes(['groups', 'orgothers', 'loginlog', 'orglog'], key);

    return (
      <li key={key} className={cx('item', { active: isActive() && subListVisible })}>
        <MdLink
          to={path}
          className={cx('stopPropagation', {
            pLeft12: isHome,
            pLeft42: !isHome,
            'activeItem bold': isActive(),
            activeExtend: isActive() && isExtend,
          })}
          onClick={() => this.setState({ subListVisible: false, menuGroupKey: null })}
        >
          {icon && <i className={cx('Font20 Gray mRight10 homeIcon', icon)} />}
          {!isExtend && key === 'home' ? (
            ''
          ) : (
            <div className="subName">
              {name}
              {hasBeta && <i className="icon-beta1 betaIcon" />}
              {(featureType === '2' || (key === 'platformintegration' && platIntegrationUpgrade) || isFreeUpgrade) && (
                <UpgradeIcon />
              )}
            </div>
          )}
        </MdLink>
      </li>
    );
  };

  handleTransition() {
    this.setState(
      {
        isExtend: !this.state.isExtend,
      },
      () => {
        safeLocalStorageSetItem('adminList_isUp', this.state.isExtend);
      },
    );
  }

  render() {
    const { currentCompanyName, isExtend, subListVisible, menuGroupKey } = this.state;
    const { menuList = [], match, location } = this.props;
    const { params } = match;
    const { pathname } = location;

    return (
      <div id="menuList" className={cx(isExtend ? 'extendList' : 'closeList')}>
        <div className="ThemeBGColor9 h100 Relative menuContainer">
          <div className="title">
            <div
              className="companyName Hand"
              onClick={() => {
                navigateTo(`/admin/home/${params.projectId}`);
              }}
            >
              {currentCompanyName}
            </div>
            <Tooltip
              placement="right"
              align={{ offset: [10, 0] }}
              title={isExtend ? _l('隐藏侧边栏') : _l('展开侧边栏')}
            >
              <span
                className={cx('Hand Font12 ThemeColor9 titleIconBox Block', isExtend ? 'icon-back-02' : 'icon-next-02')}
                onClick={this.handleTransition.bind(this)}
              ></span>
            </Tooltip>
          </div>
          <div className="listContainer pTop8 pBottom30">
            {isExtend
              ? menuList.map((item, index) => {
                  const { key, title, icon } = item;
                  let { subMenuList = [] } = item;
                  subMenuList = _.filter(
                    subMenuList,
                    ({ featureId, key }) =>
                      (!featureId || (featureId && getFeatureStatus(params.projectId, featureId))) &&
                      !(md.global.Config.IsLocal && !md.global.Config.IsPlatformLocal && key === 'billinfo'),
                  );

                  return (
                    <div key={index} className={cx({ Hidden: !subMenuList.length })}>
                      {title ? (
                        <div
                          className="subTitle flexRow alignItemsCenter Hand"
                          onClick={() => {
                            this.setState({ [`${key}Expand`]: !this.state[`${key}Expand`] });
                          }}
                        >
                          <i className={cx('Font20 Gray mRight10', icon)} />
                          <span className="flex">{title}</span>
                          <i
                            className={cx('expandIcon Font16 Gray_75 mRight12', {
                              'icon-arrow-up-border': !this.state[`${key}Expand`],
                              'icon-arrow-down-border': this.state[`${key}Expand`],
                            })}
                          />
                        </div>
                      ) : (
                        _.map(subMenuList, this.renderLinkItem)
                      )}
                      {key === 'home' ? (
                        ''
                      ) : (
                        <ul
                          className="manageItems overflowHidden"
                          style={{ height: !this.state[`${key}Expand`] ? 0 : subMenuList.length * 48 }}
                        >
                          {_.map(subMenuList, this.renderLinkItem)}
                        </ul>
                      )}
                    </div>
                  );
                })
              : menuList.map(item => {
                  const { key, title, icon, subMenuList = [] } = item;
                  const currentPathNames = _.reduce(
                    subMenuList,
                    (result, { routes = [] }) => {
                      let temp = routes.map(r => r.path);
                      return result.concat(temp);
                    },
                    [],
                  );

                  return (
                    <div key={key} className={cx({ Hidden: !subMenuList.length })}>
                      {key === 'home' ? (
                        _.map(subMenuList, this.renderLinkItem)
                      ) : (
                        <Trigger
                          action={['click']}
                          popupVisible={subListVisible && menuGroupKey === key}
                          onPopupVisibleChange={visible => this.setState({ subListVisible: visible })}
                          popup={
                            <div className="hoverMenuWrap">
                              <div className="Gray_9e Font12 pLeft20 mBottom10">{title}</div>
                              <ul className="manageItems overflowHidden" style={{ height: subMenuList.length * 48 }}>
                                {_.map(subMenuList, this.renderLinkItem)}
                              </ul>
                            </div>
                          }
                          popupAlign={{
                            points: ['tr', 'br'],
                            offset: [-40, -40],
                            overflow: { adjustX: true, adjustY: true },
                          }}
                        >
                          <div
                            className={cx('shrinkNav flexRow alignItemsCenter Hand', {
                              activeSubTitle: _.some(currentPathNames, path => pathToRegexp(path).test(pathname)),
                            })}
                            onMouseEnter={() => this.setState({ subListVisible: true, menuGroupKey: key })}
                          >
                            <i className={cx('Font20 Gray mRight10', icon)} />
                          </div>
                        </Trigger>
                      )}
                    </div>
                  );
                })}
          </div>
        </div>
      </div>
    );
  }
}
