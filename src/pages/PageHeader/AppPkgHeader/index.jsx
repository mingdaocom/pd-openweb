import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import api from 'api/homeApp';
import _ from 'lodash';
import { updateSheetListLoading } from 'src/pages/worksheet/redux/actions/sheetList';
import { browserIsMobile } from 'src/utils/common';
import { navigateTo } from '../../../router/navigateTo';
import { getIds } from '../util';
import AppDetail from './AppDetail';
import './index.less';

@connect(undefined, dispatch => ({
  updateSheetListLoading: bindActionCreators(updateSheetListLoading, dispatch),
}))
export default class AppPkgHeader extends Component {
  constructor(props) {
    super(props);
    this.isRequest = false;
    if (
      (props.path === '/worksheet/:worksheetId?' || props.path === '/worksheet/:worksheetId/view/:viewId') &&
      location.href.indexOf('/row/') < 0
    ) {
      this.compatibleWorksheetRoute();
    }
    const { appId, groupId, worksheetId } = getIds(props);
    if (appId && !worksheetId && !groupId) {
      this.completePara({ appId, groupId });
    }
  }

  componentWillReceiveProps(nextProps) {
    const { appId, groupId, worksheetId } = getIds(nextProps);
    if (appId === _.get(window, 'appInfo.id') && _.get(window, 'appInfo.currentPcNaviStyle') === 2) {
      return;
    }
    if (appId !== getIds(this.props).appId || groupId !== getIds(this.props).groupId) {
      this.isRequest = false;
    }
    if (appId && !worksheetId && !groupId) {
      this.completePara({ appId, groupId });
    }
  }

  // 兼容形如 /worksheet/:worksheetId?的旧工作表路由
  compatibleWorksheetRoute = () => {
    const { worksheetId, viewId } = getIds(this.props);
    api.getAppSimpleInfo({ workSheetId: worksheetId }).then(({ appId, appSectionId, workSheetId }) => {
      if (appId && appSectionId) {
        if (browserIsMobile()) {
          location.href = `/mobile/recordList/${appId}/${appSectionId}/${workSheetId}${viewId ? '/' + viewId : ''}${location.search || ''}`;
        } else {
          navigateTo(
            `/app/${appId}/${appSectionId}/${workSheetId}${viewId ? '/' + viewId : ''}${location.search || ''}`,
            true,
          );
        }
      }
    });
  };

  /**
   * 参数补齐
   */
  completePara = data => {
    if (this.isRequest) return;
    this.isRequest = true;
    const appId = md.global.Account.isPortal ? md.global.Account.appId : data.appId;
    api
      .getAppFirstInfo({
        appId,
        appSectionId: data.groupId,
      })
      .then(({ appSectionId, workSheetId }) => {
        if (appSectionId) {
          navigateTo(`/app/${appId}/${appSectionId}/${workSheetId || ''}?flag=${Date.now()}`, true);
        } else {
          this.props.updateSheetListLoading(false);
        }
      });
  };

  render() {
    const { ...props } = this.props;

    return <AppDetail {...props} />;
  }
}
