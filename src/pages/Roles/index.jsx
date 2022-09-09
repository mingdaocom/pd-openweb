import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Icon, LoadDiv, Support, WaterMark } from 'ming-ui';
import * as actionsPortal from 'src/pages/Roles/Portal/redux/actions.js';
import cx from 'classnames';
import HomeAjax from 'src/api/homeApp';
import { getIds } from '../PageHeader/util';
import { navigateTo } from 'router/navigateTo';
import { isHaveCharge } from 'src/pages/worksheet/redux/actions/util';
import styles from './style.less?module';
import styled from 'styled-components';
import DocumentTitle from 'react-document-title';
import Portal from './Portal/index';
import Trigger from 'rc-trigger';
import openImg from './img/open.gif';
import { editExPortalEnable, getPortalEnableState } from 'src/api/externalPortal';
import RoleCon from './RoleCon';
import { getFeatureStatus, buriedUpgradeVersionDialog } from 'src/util';
const EDITTYLE_CONFIG = [_l('常规'), _l('外部门户')];
const Wrap = styled.div`
  flex: 1;
  display: block;
  text-align: center;
  & > span {
    padding: 0 20px;
    font-weight: 500;
    color: #757575;
    line-height: 50px;
    display: inline-block;
    &:hover {
      color: #2196f3;
    }
    &.current {
      position: relative;
      color: #2196f3;
      &::after {
        content: ' ';
        width: calc(100% - 40px);
        height: 4px;
        background: #2196f3;
        display: inline-block;
        position: absolute;
        left: 20px;
        bottom: 0;
      }
    }
  }
`;
const WrapOpenPortalBtn = styled.div`
  padding: 0 14px 0 8px;
  line-height: 36px;
  height: 36px;
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
      color: #333333;
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

class AppRole extends PureComponent {
  state = {
    applyList: undefined,
    appDetail: undefined,
    roles: null,
    show: false,
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
  };

  componentDidMount() {
    const {
      match: {
        params: { editType },
      },
    } = this.props;
    this.ids = getIds(this.props);
    this.fetchPortalInfo();
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

  fetch(props = this.props, withAppDetail = true) {
    const {
      match: {
        params: { appId },
      },
    } = props;

    HomeAjax.getAppDetail({
      appId,
    }).then(appDetail => {
      this.setState({ appDetail, loading: false });
    });
  }
  fetchPortalInfo = (props = this.props) => {
    const {
      match: {
        params: { appId, editType },
      },
    } = props;
    getPortalEnableState({
      appId,
    }).then((portalBaseSet = {}) => {
      this.setState(
        {
          isOpenPortal: portalBaseSet.isEnable,
          hasGetIsOpen: true,
          editType: editType === 'external' ? 1 : 0,
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

  render() {
    const { appDetail = {}, loading, openLoading, editType, showPortalRoleSetting, isOpenPortal } = this.state;
    const { projectId = '' } = appDetail;
    const {
      match: {
        params: { appId },
      },
    } = this.props;
    const isAdmin = isHaveCharge(appDetail.permissionType, appDetail.isLock);
    if (loading) {
      return <LoadDiv />;
    }
    const featureType = getFeatureStatus(projectId, 11);

    return (
      <WaterMark projectId={projectId}>
        <div className={styles.roleWrapper}>
          <DocumentTitle title={`${appDetail.name || ''} - ${_l('用户')}`} />
          <div className={cx(styles.topBar, { mBottom0: editType === 1 })}>
            <div className={styles.topBarContent}>
              <span className="Font18 Bold mRight24 LineHeight50">{_l('用户')}</span>
            </div>
            {isAdmin && isOpenPortal && (
              <Wrap className="editTypeTab">
                {[0, 1].map(o => {
                  if (o === 1 && !featureType) return;
                  return (
                    <span
                      className={cx('editTypeTabLi Hand', { current: editType === o })}
                      onClick={() => {
                        if (o === editType) {
                          return;
                        }
                        if (o === 1) {
                          if (featureType === '2') {
                            buriedUpgradeVersionDialog(projectId, 11);
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
                      }}
                    >
                      {EDITTYLE_CONFIG[o]}
                    </span>
                  );
                })}
              </Wrap>
            )}
            {isAdmin && !isOpenPortal && featureType && (
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
                        <li>{_l('支持微信、手机验证码登录。')}</li>
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
                          editExPortalEnable({ appId, isEnable: !this.state.isEnable }).then(res => {
                            if (res) {
                              window.appInfo.epEnableStatus = !this.state.isEnable;
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
                        href="https://help.mingdao.com/external.html"
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
          </div>
          {editType === 0 ? (
            <RoleCon {...this.props} appDetail={this.state.appDetail} />
          ) : (
            <Portal
              {...this.props}
              appDetail={this.state.appDetail}
              projectId={projectId}
              portalName={appDetail.name}
              appId={appId}
              closePortal={() => {
                editExPortalEnable({ appId, isEnable: false }).then(res => {
                  if (res) {
                    window.appInfo.epEnableStatus = false;
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
        </div>
      </WaterMark>
    );
  }
}
const mapStateToProps = state => ({
  portal: state.portal,
});
const mapDispatchToProps = dispatch => bindActionCreators(actionsPortal, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(AppRole);
