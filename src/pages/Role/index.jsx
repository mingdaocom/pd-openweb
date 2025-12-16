import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import DocumentTitle from 'react-document-title';
import { navigateTo } from 'router/navigateTo';
import styled from 'styled-components';
import { Dialog, LoadDiv, WaterMark } from 'ming-ui';
import AppManagementAjax from 'src/api/appManagement';
import externalPortalAjax from 'src/api/externalPortal';
import HomeAjax from 'src/api/homeApp';
import AppRoleCon from 'src/pages/Role/AppRoleCon';
import Portal from 'src/pages/Role/PortalCon/index';
import * as actionsPortal from 'src/pages/Role/PortalCon/redux/actions.js';
import { canEditApp, canEditData, getUserRole } from 'src/pages/worksheet/redux/actions/util';
import { getAppLangDetail, getTranslateInfo } from 'src/utils/app';
import { setFavicon } from 'src/utils/app';
import { emitter } from 'src/utils/common';
import { getIds } from '../PageHeader/util';
import Header from './Header';

const RoleWrapper = styled.div`
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
`;

class AppRole extends Component {
  state = {
    applyList: undefined,
    appDetail: undefined,
    roles: null,
    loading: true,
    // 是否对非管理员隐藏角色详情
    isOpenPortal: false, //是否开启外部门户
    editType: 0, //0:用户角色编辑 1:外部门户编辑
    portalBaseSet: {},
    hasGetIsOpen: false,
    roleDebug: false,
  };

  componentDidMount() {
    this.ids = getIds(this.props);
    this.fetchPortalInfo();
    this.getSetting();
    $('html').addClass('roleBody');
  }

  componentWillReceiveProps(nextProps) {
    this.ids = getIds(this.props);
    const {
      match: {
        params: { appId: currentAppId },
      },
    } = this.props;
    const {
      match: {
        params: { appId: nextAppId, editType },
      },
    } = nextProps;
    const { hasGetIsOpen, isOpenPortal } = this.state;
    if (currentAppId !== nextAppId || !hasGetIsOpen) {
      this.setState({
        loading: true,
      });
      this.fetchPortalInfo(nextProps);
    } else {
      if (editType === 'external' && !isOpenPortal) {
        navigateTo(`/app/${nextAppId}/role`);
      }
      this.setState({
        editType: editType === 'external' && isOpenPortal ? 1 : 0,
      });
    }
  }

  componentWillUnmount() {
    $('html').removeClass('roleBody');
  }

  fetch(props = this.props) {
    const {
      match: {
        params: { appId },
      },
    } = props;

    HomeAjax.getApp({
      appId,
      getLang: true,
    }).then(appDetail => {
      emitter.emit('UPDATE_GLOBAL_STORE', 'appInfo', appDetail);
      getAppLangDetail(appDetail).then(() => {
        appDetail.name = getTranslateInfo(appDetail.id, null, appDetail.id).name || appDetail.name;
        setFavicon(appDetail.iconUrl, appDetail.iconColor);
        this.setState({ appDetail, loading: false });
        const {
          match: {
            params: { appId, editType },
          },
        } = this.props;
        window[`timeZone_${appId}`] = appDetail.timeZone;

        if (
          editType === 'external' &&
          !(
            (canEditApp(appDetail.permissionType, appDetail.isLock) || canEditData(appDetail.permissionType)) &&
            this.state.isOpenPortal
          )
        ) {
          navigateTo(`/app/${appId}/role`);
        }
      });
    });
  }
  fetchPortalInfo = (props = this.props) => {
    const {
      match: {
        params: { appId, editType },
      },
    } = props;
    externalPortalAjax
      .getPortalEnableState({
        appId,
      })
      .then((portalBaseSet = {}) => {
        this.setState(
          {
            isOpenPortal: portalBaseSet.isEnable,
            hasGetIsOpen: true,
            editType: editType === 'external' ? 1 : 0,
            loading: true,
          },
          () => {
            this.fetch(props);
            if (!portalBaseSet.isEnable && editType === 'external') {
              //无权限进外部门户编辑 跳转到 内部成员
              navigateTo(`/app/${appId}/role`);
              this.setState({
                editType: 0,
              });
            }
          },
        );
      });
  };

  getSetting = () => {
    const {
      match: {
        params: { appId },
      },
    } = this.props;

    AppManagementAjax.getAppRoleSetting({ appId }).then(data => {
      this.setState({ roleDebug: data.isDebug });
    });
  };

  handleChangePage = callback => {
    if (this.child && this.child.state.hasChange) {
      let isNew = !this.child.props.roleId || this.child.props.roleId === 'new';
      return Dialog.confirm({
        title: isNew ? _l('创建当前新增的角色？') : _l('保存当前角色权限配置 ？'),
        okText: isNew ? _l('创建') : _l('保存'),
        cancelText: isNew ? _l('不创建') : _l('不保存'),
        width: 440,
        onOk: () => {
          this.child.state.hasChange = false;
          this.child.setState({
            hasChange: false,
          });
          this.child.onSave(true);
        },
        onCancel: () => {
          this.child.state.hasChange = false;
          this.child.setState({
            hasChange: false,
          });
          this.child.onFormat();
          callback && callback();
        },
      });
    } else {
      callback && callback();
    }
  };

  render() {
    const { appDetail = {}, loading, editType, isOpenPortal, roleDebug } = this.state;
    const { projectId = '' } = appDetail;
    const {
      match: {
        params: { appId },
      },
    } = this.props;
    let { isOwner, isAdmin } = getUserRole(appDetail.permissionType);
    isAdmin = isOwner || isAdmin;
    const editApp = canEditApp(appDetail.permissionType, appDetail.isLock);
    const editUser = canEditData(appDetail.permissionType);

    if (loading) {
      return <LoadDiv />;
    }

    return (
      <WaterMark projectId={projectId}>
        <RoleWrapper>
          <DocumentTitle title={`${appDetail.name || ''} - ${_l('用户')}`} />
          <Header
            {...this.props}
            isOpenPortal={isOpenPortal}
            appDetail={appDetail}
            editType={editType}
            roleDebug={roleDebug}
            handleChangePage={this.handleChangePage}
            onChangeStates={(data, cb) => this.setState(data, cb)}
          />
          {editType === 0 ? (
            <AppRoleCon
              {...this.props}
              appId={appId}
              isAdmin={isAdmin}
              isOwner={isOwner}
              canEditApp={editApp}
              canEditUser={editUser}
              projectId={projectId}
              isOpenPortal={isOpenPortal}
              onRef={ref => {
                this.child = ref;
              }}
              appDetail={appDetail}
              handleChangePage={this.handleChangePage}
              editType={editType}
            />
          ) : (
            <Portal
              {...this.props}
              onRef={ref => {
                this.child = ref;
              }}
              isOwner={isOwner}
              handleChangePage={this.handleChangePage}
              isAdmin={isAdmin}
              canEditApp={editApp}
              canEditUser={editUser}
              appDetail={appDetail}
              projectId={projectId}
              appId={appId}
              editType={editType}
              closePortal={() => {
                externalPortalAjax.editExPortalEnable({ appId, isEnable: false }).then(res => {
                  if (res) {
                    navigateTo(`/app/${appId}/role`);
                    this.setState({ isOpenPortal: false, editType: 0 });
                  } else {
                    alert(_l('关闭失败！'), 2);
                  }
                });
              }}
            />
          )}
        </RoleWrapper>
      </WaterMark>
    );
  }
}
const mapStateToProps = state => ({
  portal: state.portal,
});
const mapDispatchToProps = dispatch => bindActionCreators(actionsPortal, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(AppRole);
