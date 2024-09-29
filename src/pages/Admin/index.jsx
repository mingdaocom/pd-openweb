import React, { PureComponent } from 'react';
import { LoadDiv, WaterMark } from 'ming-ui';
import Config from './config';
import AdminCommon from './common/common';
import { Switch, Route } from 'react-router-dom';
import Menu from './menu';
import ApplyRole from './organization/roleAuth/apply';
import MyRole from './organization/roleAuth/myRole';
import Empty from './common/TableEmpty';
import { menuList } from './router.config.js';
import { ROUTE_CONFIG, PERMISSION_ENUM } from './enum';
import Loadable from 'react-loadable';
import { navigateTo } from 'router/navigateTo';
import { getCurrentProject, getFeatureStatus } from 'src/util';
import './index.less';
import _ from 'lodash';
import withoutPermission from 'src/pages/worksheet/assets/withoutPermission.png';

const getComponent = component =>
  Loadable({
    loader: component,
    loading: () => null,
  });

const withParams = (Component, params) => {
  const ParamsComponent = props => <Component {...props} {...params} />;
  return ParamsComponent;
};

const CommonEmpty = (
  <div className="commonIndexEmpty">
    <Empty
      detail={{
        icon: 'icon-task_custom_ic_task_internet',
        desc: _l('您的账号不是该组织成员'),
      }}
    />
  </div>
);

const NoPermission = (
  <div className="noPermissionWrapper">
    <img className="img" src={withoutPermission} />
    <div className="Gray_75 Font17 mTop30">{_l('无权限，请联系管理员')}</div>
  </div>
);

export default class AdminEntryPoint extends PureComponent {
  state = {
    isLoading: true,
    authority: [],
    routeKeys: [],
  };

  componentWillMount() {
    if (_.isNull(localStorage.getItem('adminList_isUp'))) {
      safeLocalStorageSetItem('adminList_isUp', true);
    }
  }

  componentDidMount() {
    $('html').addClass('AppAdmin');
    this.init();
  }

  componentWillReceiveProps(nextProps) {
    const projectId = _.get(nextProps, 'match.params.projectId');

    if (projectId !== Config.projectId) {
      this.setState({ isLoading: true });
      this.init();
    } else {
      Config.getParams();
    }
  }

  componentWillUnmount() {
    $('html').removeClass('AppAdmin');
  }

  init() {
    AdminCommon.getAuthority().then(authority => {
      this.setState({ isLoading: false, authority, routeKeys: this.getRouterKeys(authority) });
    });
  }

  //获取权限模块
  getRouterKeys(authority) {
    const projectId = _.get(this.props, 'match.params.projectId');

    if (_.isArray(authority)) {
      let keys = [];
      authority.map(item => {
        keys = keys.concat(ROUTE_CONFIG[item] || []);
      });

      const subMenuArray = _.flatten(menuList.map(item => item.subMenuList));

      const result = _.uniq(keys).filter(key => {
        if (md.global.Config.IsLocal) {
          if (key === 'aggregationTable' && !md.global.Config.EnableDataPipeline) return;
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
        }

        const itemMenu = subMenuArray.filter(sub => sub.key === key)[0] || {};
        let featureType = getFeatureStatus(projectId, itemMenu.featureId);

        if (itemMenu.featureIds) {
          itemMenu.featureIds
            .filter(l => !md.global.Config.IsPlatformLocal || !itemMenu.platformHiddenIds.includes(l))
            .forEach((l, i) => {
              let itemFeatureType = getFeatureStatus(projectId, l);
              if (itemFeatureType) {
                featureType = featureType ? Math.min(itemFeatureType, featureType).toString() : itemFeatureType;
              }
            });
        }

        return !(_.includes(['analytics', 'applog', 'computing', 'aggregationTable'], key) && !featureType);
      });

      return result;
    }
  }

  renderHomeContent(routes) {
    const { authority } = this.state;
    const childRoutes = _.reduce(
      routes,
      (result, { subMenuList = [] }) => {
        return result.concat(...subMenuList.map(item => item.routes));
      },
      [],
    );
    const isExtend = JSON.parse(localStorage.getItem('adminList_isUp'));
    const projectId = _.get(this.props, 'match.params.projectId');

    return (
      <WaterMark projectId={projectId}>
        <div className="adminMainContent w100">
          <div className="flexRow w100 mainContainerWrapper">
            <Menu isExtend={isExtend} menuList={routes} />
            <div id="mainContainer" className="Relative">
              <Switch>
                {childRoutes.map(({ path, exact, component }) => {
                  return (
                    <Route
                      key={path}
                      exact={exact}
                      path={path}
                      component={withParams(getComponent(component), { authority })}
                    />
                  );
                })}
              </Switch>
            </div>
          </div>
        </div>
      </WaterMark>
    );
  }

  renderRoutes() {
    const { routeKeys, authority = [] } = this.state;
    // 根据权限控制模块展示
    const routesWithAuthority = _.reduce(
      menuList,
      (result, { title, subMenuList = [], key, icon }) => {
        let item = { title, subMenuList: subMenuList.filter(item => routeKeys.includes(item.key)), key, icon };
        return result.concat([item]);
      },
      [],
    );

    return (
      <Switch>
        <Route path="/admin/mycharacter/:projectId" component={() => <MyRole authority={authority} />} />
        <Route path="/admin/apply/:projectId/:roleId?" component={() => <ApplyRole authority={authority} />} />
        <Route path="/admin/:routeType/:projectId">{this.renderHomeContent(routesWithAuthority)}</Route>
      </Switch>
    );
  }

  getCurrentAuth(routeKeys = []) {
    const pathNameArr = (location.pathname.toLocaleLowerCase().split('/') || []).filter(item => item);
    const currentItem = routeKeys.filter(item => pathNameArr.includes(item.toLocaleLowerCase()));
    return !currentItem.length;
  }

  render() {
    const { authority = [], isLoading, routeKeys } = this.state;
    let { isSuperAdmin } = getCurrentProject(Config.projectId, true);

    if (isLoading) {
      return <LoadDiv className="mTop10" />;
    }

    //没有任何权限
    if (!authority.length) {
      return NoPermission;
    }

    //不是组织成员
    if (authority.includes(PERMISSION_ENUM.NOT_MEMBER)) {
      return CommonEmpty;
    }

    //没有权限，可以申请管理员
    if (authority.includes(PERMISSION_ENUM.SHOW_APPLY) && !location.href.includes('admin/apply')) {
      navigateTo('/admin/apply/' + Config.projectId);
      return null;
    }

    //有权限，但是没有组织后台菜单权限
    if (authority.includes(PERMISSION_ENUM.SHOW_MY_CHARACTER) && !location.href.includes('admin/mycharacter')) {
      navigateTo('/admin/mycharacter/' + Config.projectId);
      return null;
    }

    //超管跳转到首页
    if ((location.href.includes('admin/index') || location.href.includes('admin/apply')) && isSuperAdmin) {
      navigateTo('/admin/home/' + Config.projectId);
      return null;
    }

    if (
      this.getCurrentAuth(routeKeys) &&
      routeKeys.filter(route => !ROUTE_CONFIG[PERMISSION_ENUM.CAN_PURCHASE].includes(route)).length
    ) {
      navigateTo('/admin/' + (routeKeys.includes('home') ? 'home' : routeKeys[0]) + '/' + Config.projectId);
      return null;
    }

    return this.renderRoutes();
  }
}
