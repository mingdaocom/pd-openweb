import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Icon, LoadDiv, Support, WaterMark, Tooltip, Dialog, Switch, SvgIcon } from 'ming-ui';
import { getHelpUrl } from 'src/common/helpUrls';
import DocumentTitle from 'react-document-title';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import HomeAjax from 'src/api/homeApp';
import { getIds } from '../PageHeader/util';
import { navigateTo } from 'router/navigateTo';
import * as actionsPortal from 'src/pages/Role/PortalCon/redux/actions.js';
import { getUserRole, canEditApp, canEditData } from 'src/pages/worksheet/redux/actions/util';
import Portal from 'src/pages/Role/PortalCon/index';
import openImg from './img/open.gif';
import externalPortalAjax from 'src/api/externalPortal';
import AppRoleCon from 'src/pages/Role/AppRoleCon';
import { getFeatureStatus, buriedUpgradeVersionDialog, setFavicon } from 'src/util';
import { VersionProductType } from 'src/util/enum';
import _ from 'lodash';
import { sysRoleType } from './config';
import AppManagementAjax from 'src/api/appManagement';

const EDITTYLE_CONFIG = [_l('常规'), _l('外部门户')];
const RoleWrapper = styled.div`
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const IconWrap = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  line-height: normal;
  margin-left: -3px;
  &:hover {
    box-shadow: inset 0 0 20px 20px rgba(0, 0, 0, 0.1);
  }
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding-right: 24px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.16);
  background-color: #ffffff;
  z-index: 1;
  .Gray_bd {
    &:hover {
      color: #9e9e9e !important;
    }
  }
  .valignWrapper {
    &.isAbsolute {
      position: absolute;
      right: 24px;
    }
  }
`;

const Wrap = styled.div`
  flex: 1;
  display: block;
  text-align: center;
  & > span {
    padding: 0 12px;
    margin: 0 10px;
    line-height: 48px;
    display: inline-block;
    box-sizing: border-box;
    line-height: 44px;
    border-top: 3px solid transparent;
    border-bottom: 3px solid transparent;
    &.current {
      position: relative;
      color: #2196f3;
      border-bottom: 3px solid #2196f3;
    }
  }
`;
const WrapOpenPortalBtn = styled.div`
  padding: 0 14px 0 8px;
  line-height: 34px;
  height: 34px;
  background: #f3faff;
  border-radius: 18px;
  color: #2196f3;
  font-weight: 500;
  &:hover {
    background: #ebf6fe;
  }
  .set {
    margin-top: -4px;
    display: inline-block;
    vertical-align: middle;
  }
`;
const WrapPop = styled.div`
  width: 640px;
  background: #ffffff;
  box-shadow: 0px 5px 24px rgba(0, 0, 0, 0.24);
  border-radius: 5px;
  overflow: hidden;
  img {
    width: 100%;
  }
  .con {
    padding: 24px;
    line-height: 26px;
    h6 {
      font-size: 15px;
      font-weight: 600;
      color: #151515;
    }
    li {
      color: #757575;
      line-height: 24px;
      font-weight: 400;
      &::before {
        content: ' ';
        width: 5px;
        height: 5px;
        display: inline-block;
        background: #757575;
        border-radius: 50%;
        line-height: 32px;
        margin-right: 10px;
        vertical-align: middle;
      }
    }
    .btn {
      margin-top: 16px;
      line-height: 36px;
      background: #2196f3;
      border-radius: 3px;
      padding: 0 24px;
      color: #fff;
      font-weight: 600;
      &:hover {
        background: #1e88e5;
      }
    }
    .helpPortal {
      line-height: 36px;
      float: right;
      margin-top: 16px;
      font-weight: 500;
    }
  }
`;

const RoleDebugSwitch = styled(Switch)`
  width: 23px !important;
  height: 14px !important;
  border-radius: 7px !important;
  &.ming.Switch.small .dot {
    width: 10px;
    height: 10px;
  }
  &.ming.Switch--off .dot {
    left: 2px;
  }
  &.ming.Switch--on.small .dot {
    left: 11px;
  }
`;

const DividerVertical = styled.div`
  width: 1px;
  height: 25px;
  opacity: 1;
  border: none;
  background: #eaeaea;
`;

class AppRole extends Component {
  state = {
    applyList: undefined,
    appDetail: undefined,
    roles: null,
    loading: true,
    openLoading: false,
    showApplyDialog: false,
    activeRoleId: null,
    // 是否对非管理员隐藏角色详情
    rolesVisibleConfig: null,
    quitAppConfirmVisible: false,
    isOpenPortal: false, //是否开启外部门户
    editType: 0, //0:用户角色编辑 1:外部门户编辑
    showPortalSetting: false,
    showPortalRoleSetting: false,
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

  fetch(props = this.props, withAppDetail = true) {
    const {
      match: {
        params: { appId },
      },
    } = props;

    HomeAjax.getApp({
      appId,
    }).then(appDetail => {
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
    const {
      appDetail = {},
      loading,
      openLoading,
      editType,
      showPortalRoleSetting,
      isOpenPortal,
      roleDebug,
    } = this.state;
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
    const canEndterPortal = editApp || editUser;
    const { iconColor, name, iconUrl } = appDetail;
    if (loading) {
      return <LoadDiv />;
    }
    const featureType = canEndterPortal ? getFeatureStatus(projectId, VersionProductType.externalPortal) : false;

    return (
      <WaterMark projectId={projectId}>
        <RoleWrapper>
          <DocumentTitle title={`${appDetail.name || ''} - ${_l('用户')}`} />
          <TopBar className={cx('', { mBottom0: editType === 1 })}>
            <div
              className="flexRow pointer Gray_bd mLeft16"
              onClick={() => {
                window.disabledSideButton = true;

                const storage =
                  JSON.parse(localStorage.getItem(`mdAppCache_${md.global.Account.accountId}_${appId}`)) || {};

                if (storage) {
                  const { lastGroupId, lastWorksheetId, lastViewId } = storage;
                  navigateTo(
                    `/app/${appId}/${[lastGroupId, lastWorksheetId, lastViewId]
                      .filter(o => o && !_.includes(['undefined', 'null'], o))
                      .join('/')}?from=insite`,
                  );
                } else {
                  navigateTo(`/app/${appId}`);
                }
              }}
            >
              <Tooltip popupPlacement="bottomLeft" text={<span>{_l('应用：%0', name)}</span>}>
                <div className="flexRow alignItemsCenter">
                  <i className="icon-navigate_before Font20" />
                  <IconWrap style={{ backgroundColor: iconColor }}>
                    <SvgIcon url={iconUrl} fill="#fff" size={18} />
                  </IconWrap>
                </div>
              </Tooltip>
            </div>
            <div
              className={cx('nativeTitle Font17 bold mLeft16 overflow_ellipsis', {
                flex: !canEndterPortal || (canEndterPortal && !isOpenPortal && featureType),
              })}
              style={{
                maxWidth: !canEndterPortal || (canEndterPortal && !isOpenPortal && featureType) ? '100%' : 200,
              }}
            >
              {/* {name} */}
              {_l('用户')}
            </div>
            {canEndterPortal && isOpenPortal && (
              <Wrap className="editTypeTab">
                {[0, 1]
                  .filter(o => (canEndterPortal ? true : o !== 1))
                  .map(o => {
                    if (o === 1 && !featureType) return;
                    return (
                      <span
                        className={cx('editTypeTabLi Hand Bold Font14', { current: editType === o })}
                        onClick={() => {
                          if (o === editType) {
                            return;
                          }
                          this.handleChangePage(() => {
                            if (o === 1) {
                              if (featureType === '2') {
                                buriedUpgradeVersionDialog(projectId, VersionProductType.externalPortal);
                                return;
                              }
                              navigateTo(`/app/${appId}/role/external`);
                              //获取外部门户的角色信息
                            } else {
                              navigateTo(`/app/${appId}/role`);
                            }
                            this.setState({
                              editType: o,
                            });
                          });
                        }}
                      >
                        {EDITTYLE_CONFIG[o]}
                      </span>
                    );
                  })}
              </Wrap>
            )}
            {editApp && !isOpenPortal && featureType && (
              <Trigger
                action={['click']}
                popup={
                  <WrapPop className="openPortalWrap">
                    <img src={openImg} className="Block" />
                    <div className="con">
                      <h6>{_l('将应用发布给组织外用户使用')}</h6>
                      <ul>
                        <li>{_l('用于提供会员服务，如：作为资料库、内容集、讨论组等。')}</li>
                        <li>{_l('用于和你的业务客户建立关系，如：服务外部客户的下单，查单等场景。')}</li>
                        <li>{_l('支持微信、手机/邮箱验证码及密码登录')}</li>
                      </ul>
                      <div
                        className={cx('btn InlineBlock', { disable: openLoading })}
                        onClick={() => {
                          if (featureType === '2') {
                            buriedUpgradeVersionDialog(projectId, 11);
                            return;
                          }
                          if (openLoading) {
                            return;
                          }
                          this.setState({
                            openLoading: true,
                          });
                          externalPortalAjax.editExPortalEnable({ appId, isEnable: !this.state.isEnable }).then(res => {
                            if (res) {
                              // window.appInfo.epEnableStatus = !this.state.isEnable;
                              this.setState({ isOpenPortal: true, editType: 1, openLoading: false }, () => {
                                navigateTo(`/app/${appId}/role/external`);
                              });
                            } else {
                              this.setState({
                                openLoading: false,
                              });
                              alert(_l('开启失败'), 2);
                            }
                          });
                        }}
                      >
                        {openLoading ? _l('开启中...') : _l('启用外部门户')}
                      </div>
                      <Support
                        href={getHelpUrl('portal', 'introduction')}
                        type={3}
                        className="helpPortal"
                        text={_l('了解更多')}
                      />
                    </div>
                  </WrapPop>
                }
                popupAlign={{
                  points: ['tr', 'tr'],
                  offset: [17, 0],
                }}
              >
                <WrapOpenPortalBtn className={cx('openPortalBtn Hand InlineBlock', { disable: openLoading })}>
                  <Icon className="Font20 Hand mLeft10 mRight6 set " icon="external_users_01" />
                  {openLoading ? _l('开启中...') : _l('启用外部门户')}
                </WrapOpenPortalBtn>
              </Trigger>
            )}
            {sysRoleType.concat(200).includes(appDetail.permissionType) && editType !== 1 && (
              <Fragment>
                {editApp && !isOpenPortal && featureType && <DividerVertical className="mLeft24" />}
                <Tooltip
                  popupPlacement="bottomLeft"
                  text={
                    <span>
                      {_l(
                        '开启后，应用的管理员、运营者、开发者可以使用不同的角色身份访问应用。请注意，该操作不会改变开发者角色的数据权限，开发者始终无法看到业务数据。',
                      )}
                    </span>
                  }
                >
                  <div
                    className={cx('mLeft24 valignWrapper', { isAbsolute: !(editApp && !isOpenPortal && featureType) })}
                  >
                    <RoleDebugSwitch
                      checked={roleDebug}
                      size="small"
                      onClick={checked => {
                        AppManagementAjax.updateAppDebugModel({
                          appId,
                          isDebug: !checked,
                        }).then(res => {
                          res && this.setState({ roleDebug: !checked });
                        });
                      }}
                    />
                    <span className="mLeft8">{_l('角色调试')}</span>
                  </div>
                </Tooltip>
              </Fragment>
            )}
          </TopBar>
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
                    // window.appInfo.epEnableStatus = false;
                    navigateTo(`/app/${appId}/role`);
                    this.setState({ isOpenPortal: false, editType: 0 });
                  } else {
                    alert(_l('关闭失败！'), 2);
                  }
                });
              }}
              showPortalRoleSetting={showPortalRoleSetting}
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
