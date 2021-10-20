import React, { PureComponent } from 'react';
import LoadDiv from 'ming-ui/components/LoadDiv';
import Config from './config';
import AdminCommon from './common/common';
import { Switch, Route, Redirect } from 'react-router-dom';
import Menu from './menu';
import ApplyComp from './apply';
import Empty from './common/TableEmpty';
import { menuList, permissionObj } from './router.config.js';
import Loadable from 'react-loadable';
import { navigateTo } from 'router/navigateTo';
import _ from 'lodash';

const getComponent = component =>
  Loadable({
    loader: component,
    loading: () => null,
  });
const AUTHORITY_DICT = Config.AUTHORITY_DICT;
const detail = {
  icon: 'icon-task_custom_ic_task_internet',
  desc: _l('您的账号不是该组织成员'),
};

const CommonEmpty = (
  <div className="commonIndexEmpty">
    <Empty detail={detail} />
  </div>
);
const { admin: {adminLeftMenu}} = window.private
export default class AdminEntryPoint extends PureComponent {
  state = {
    isLoading: true,
    authority: [],
    routeKeys: [],
  };

  componentWillMount() {
    if (_.isNull(localStorage.getItem('adminList_isUp'))) {
      localStorage.setItem('adminList_isUp', true);
    }
  }

  componentDidMount() {
    $('html').addClass('AppAdmin');
    this.init();
  }

  componentWillReceiveProps(nextProps) {
    const {
      match: {
        params: { projectId },
      },
    } = nextProps;
    if (projectId !== Config.projectId) {
      this.setState({
        isLoading: true,
      });
      this.init();
    } else {
      Config.getParams();
    }
  }

  componentWillUnmount() {
    $('html').removeClass('AppAdmin');
  }

  init() {
    AdminCommon.init().then(
      authority => {
        this.setState({ isLoading: false, authority, routeKeys: this.getRouterKeys(authority) });
      },
      authority => {
        this.setState({ isLoading: false, authority: _.isArray(authority) ? authority : [] });
      },
    );
  }

  //获取权限模块
  getRouterKeys(authority) {
    if (_.isArray(authority)) {
      let cur = [];
      authority.map(item => {
        cur = cur.concat(permissionObj[item] || []);
      });
      cur = cur.filter(item => !adminLeftMenu[item])
      return cur;
    }
  }

  renderHomeContent(routes) {
    const childRoutes = _.reduce(
      routes,
      (result, { subMenuList = [] }) => {
        return result.concat(...subMenuList.map(item => item.routes));
      },
      [],
    );
    const isExtend = JSON.parse(localStorage.getItem('adminList_isUp'));
    return (
      <div className="adminMainContent w100">
        <div className="flexRow w100 mainContainerWrapper">
          <Menu isExtend={isExtend} menuList={routes} />
          <div id="mainContainer" className="Relative">
            <Switch>
              {childRoutes.map(({ path, exact, component }) => {
                return <Route key={path} exact={exact} path={path} component={getComponent(component)} />;
              })}
            </Switch>
          </div>
        </div>
      </div>
    );
  }

  renderRoutes() {
    const { routeKeys } = this.state;
    // 根据权限控制模块展示
    const routesWithAuthority = _.reduce(
      menuList,
      (result, { title, subMenuList = [] }) => {
        let item = { title, subMenuList: subMenuList.filter(item => routeKeys.includes(item.key)) };
        return result.concat([item]);
      },
      [],
    );
    return (
      <Switch>
        <Route path="/admin/apply/:projectId/:roleId?" component={ApplyComp} />
        <Route path="/admin/:routeType/:projectId">{this.renderHomeContent(routesWithAuthority)}</Route>
      </Switch>
    );
  }

  getCurrentAuth(routeKeys = []) {
    const currentItem =
      routeKeys.filter(item => location.href.toLocaleLowerCase().includes(item.toLocaleLowerCase())) || [];
    return !currentItem.length;
  }

  render() {
    const { authority = [], isLoading, routeKeys } = this.state;
    if (isLoading) {
      return <LoadDiv className="mTop10" />;
    }

    //不是组织成员
    if (authority.indexOf(AUTHORITY_DICT.NOT_MEMBER) > -1) {
      return CommonEmpty;
    }
    //  是否有管理员基本权限
    if (authority.indexOf(AUTHORITY_DICT.HAS_PERMISSIONS) === -1 && location.href.indexOf('admin/apply') === -1) {
      navigateTo('/admin/apply/' + Config.projectId);
    } else if (location.href.indexOf('admin/index') > -1) {
      navigateTo('/admin/home/' + Config.projectId);
    } else if (this.getCurrentAuth(routeKeys) && !location.href.includes('admin/apply')) {
      navigateTo('/admin/' + routeKeys[0] + '/' + Config.projectId);
    } else {
      return this.renderRoutes();
    }
    return null;
  }
}
