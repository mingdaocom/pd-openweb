import React, { Component } from 'react';
import { Switch } from 'react-router-dom';
import genRouteComponent from '../genRouteComponent';
import { ROUTE_CONFIG, PORTAL_ROUTE_CONFIG } from './config';
import ajaxRequest from 'src/api/homeApp';
import { LoadDiv } from 'ming-ui';
import { navigateTo } from 'router/navigateTo';
import UnusualContent from 'src/components/UnusualContent';
import FixedContent from 'src/components/FixedContent';
import UpgradeContent from 'src/components/UpgradeContent';
import { getIds } from '../../pages/PageHeader/util';
import { connect } from 'react-redux';
import { setAppStatus } from '../../pages/PageHeader/redux/action';
import _ from 'lodash';
import { canEditApp } from 'src/pages/worksheet/redux/actions/util';

@connect(state => ({ appPkg: state.appPkg }), dispatch => ({ setAppStatus: status => dispatch(setAppStatus(status)) }))
export default class Application extends Component {
  constructor(props) {
    super(props);
    this.genRouteComponent = genRouteComponent();
    this.state = {
      status: 0, // 0: 加载中 1:正常 2:关闭 3:删除 4:不是应用成员 5:是应用成员但未分配视图
    };
  }

  componentDidMount() {
    let { appId, worksheetId } = this.props.match.params;
    if (md.global.Account.isPortal) {
      appId = md.global.Account.appId;
    }
    if (appId) {
      this.checkApp(appId);
    }

    // 老路由 先补齐参数
    if (worksheetId) {
      this.compatibleWorksheetRoute(worksheetId);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.match.params.appId !== this.props.match.params.appId ||
      (window.redirected && location.href.indexOf('from=system') > -1)
    ) {
      this.checkApp(nextProps.match.params.appId);
    }
  }

  /**
   * 检测应用有效性
   */
  checkApp(appId) {
    if (md.global.Account.isPortal) {
      appId = md.global.Account.appId;
    }
    ajaxRequest
      .checkApp({ appId }, { silent: true })
      .then(status => {
        if ([4].includes(status) && ['/role', '/workflow'].some(path => this.props.location.pathname.includes(path))) {
          navigateTo(`/app/${appId}`);
        }
        this.setState({ status });
        this.props.setAppStatus(status);
      })
      .catch(() => {
        this.setState({ status: 3 });
        this.props.setAppStatus({ status: 3 });
      });
  }

  /**
   * 兼容老路由补齐参数
   */
  compatibleWorksheetRoute(worksheetId) {
    ajaxRequest
      .getAppSimpleInfo({ workSheetId: worksheetId }, { silent: true })
      .then(result => {
        const { appId, appSectionId } = result;

        if (!appId || !appSectionId) {
          this.setState({ status: 3 });
        }
      })
      .catch(() => {
        this.setState({ status: 6 });
      });
  }

  render() {
    let { status } = this.state;
    const {
      location: { pathname },
      appPkg,
    } = this.props;
    let { appId } = getIds(this.props);
    if (md.global.Account.isPortal) {
      appId = md.global.Account.appId;
    }
    const { permissionType, fixed, pcDisplay, appStatus } = appPkg;
    const isAuthorityApp = canEditApp(permissionType);

    if (status === 0) {
      return <LoadDiv />;
    }

    if (_.includes([10, 11, 12], appStatus)) {
      return <UpgradeContent appPkg={appPkg} />;
    }

    if (_.includes([20], appStatus)) {
      return <UnusualContent appPkg={appPkg} status={appStatus} appId={appId} />;
    }

    if ((pcDisplay || fixed) && !isAuthorityApp && !_.includes(pathname, 'role')) {
      return <FixedContent appPkg={appPkg} isNoPublish={pcDisplay} />;
    }

    if (_.includes([1], status) || (status === 5 && _.includes(pathname, 'role'))) {
      return <Switch>{this.genRouteComponent(md.global.Account.isPortal ? PORTAL_ROUTE_CONFIG : ROUTE_CONFIG)}</Switch>;
    }

    return <UnusualContent appPkg={appPkg} status={status} appId={appId} />;
  }
}
