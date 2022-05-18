import React, { Component } from 'react';
import DialogLayer from 'mdDialog';
import ReactDom from 'react-dom';
import { connect } from 'react-redux';
import api from 'api/homeApp';
import 'src/pages/PageHeader/AppNameHeader/index.less';
import { navigateTo } from 'src/router/navigateTo.jsx';
import { Icon } from 'ming-ui';
import SvgIcon from 'src/components/SvgIcon';
import styled from 'styled-components';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import withClickAway from 'ming-ui/decorators/withClickAway';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
const ClickAwayable = createDecoratedComponent(withClickAway);
import cx from 'classnames';
import UserInfoDialog from 'src/pages/Roles/Portal/components/UserInfoDialog';
import './index.less';
import { getDetail, saveUserDetail } from 'src/api/externalPortal';
import { browserIsMobile } from 'src/util';
import { formatControlToServer } from 'src/components/newCustomFields/tools/utils.js';
import { getIds } from 'src/pages/PageHeader/util';
import { updateSheetListLoading } from 'src/pages/worksheet/redux/actions/sheetList';
import login from 'src/api/login';
import { removePssId } from 'src/util/pssId';
import { renderText } from 'src/pages/Roles/Portal/list/util';
import AvatorInfo from 'src/pages/Personal/personalInfo/modules/AvatorInfo.jsx';
import 'src/pages/Personal/personalInfo/modules/index.less';
import account from 'src/api/account';
import 'src/pages/PageHeader/AppPkgHeader/index.less';
import { updateAppGroup, syncAppDetail } from 'src/pages/PageHeader/redux/action';
import AppGroup from 'src/pages/PageHeader/AppPkgHeader/AppGroup';
import TelDialog from './TelDialog';
import DelDialog from './DelDialog';
import PortalMessage from './PortalMessage';
const WrapHeader = styled.div`
  .cover {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.1);
    z-index: 999;
  }
  .headerCenter {
    flex: 1;
    display: flex;
    align-items: center;
  }
  .appNameHeaderBoxPortal {
    top: 0;
    width: 100%;
    z-index: 2;
    display: flex;
    position: relative;
    &.isMobile {
      height: 70px;
      .avatarM {
        line-height: 70px;
      }
    }
    .appName {
      height: 100%;
      width: 100%;
      max-width: 188px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      &.isFixed {
        width: auto;
      }
      &.appNameM {
        max-width: 280px;
        font-weight: bold;
        font-size: 24px !important;
        padding-left: 16px;
        line-height: 70px;
      }
    }
    .appItemsOuterWrap {
      &.Hidden {
        display: none;
      }
      display: flex;
      height: 100%;
      align-items: center;
      flex: 1 1 0%;
      position: relative;
      overflow: hidden;
      .appItemsInnerWrap {
        position: absolute;
        top: 0;
        left: 0;
        height: 70px;
        width: 100%;
        overflow-x: scroll;
        overflow-y: hidden;
        .appItemsWrap {
          display: flex;
          position: absolute;
          left: 0;
          width: 100%;
          height: 50px;
          li {
            display: flex;
            height: 100%;
            align-items: center;
            position: relative;
            box-sizing: border-box;
            white-space: nowrap;
            cursor: pointer;
            color: #fff;
            flex-shrink: 0;
            font-weight: bold;
            padding: 0 20px;
            &.active {
              background-color: rgba(0, 0, 0, 0.15);
            }
          }
        }
      }
    }
  }
  .appFixed {
    border-radius: 13px;
    color: #fff;
    height: 22px;
    line-height: 22px;
    box-sizing: border-box;
    white-space: nowrap;
    font-weight: bold;
    padding: 0 10px;
    font-size: 12px;
    margin-left: 5px;
    background: #fd7558;
  }
`;
const Wrap = styled.div`
  position: absolute;
  right: 0;
  height: calc(100% - 50px);
  top: 51px;
  width: 480px;
  max-width: 80%;
  background: #fff;
  box-shadow: 0 1px 2px rgb(0 0 0 / 24%);
  z-index: 1000;
  .infoConBox {
    height: calc(100% - 70px);
    overflow: auto;
    padding: 24px;
  }
  .infoBox {
    overflow: auto;
    .cellOptions {
      max-width: 100%;
      .cellOption {
        max-width: 100%;
      }
    }
  }
  &.isMobile {
    top: 0;
    height: 100%;
    min-width: 100% !important;
    .back {
      height: 70px;
      line-height: 70px;
    }
    .infoConBox {
      height: calc(100% - 140px);
      padding: 6px 24px 24px;
    }
  }
  .closeBtnN {
    position: absolute;
    right: 10px;
    top: 10px;
  }
  img.userAvatar {
  }
  .userName {
    line-height: 56px;
    word-wrap: break-word;
    word-break: break-all;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
  }
  .title {
    width: 56px;
  }
  .rInfo {
    width: calc(100% - 56px);
    &.isOption {
      .editableCellCon {
        padding-left: 0px !important;
      }
    }
  }
  .logoutBox {
    display: flex;
  }
  .del {
    flex: 4;
    height: 36px;
    background: rgba(243, 33, 33, 0.1);
    color: #f44336;
    border-radius: 36px;
    line-height: 36px;
    text-align: center;
    margin: 16px 16px 16px 8px;
    .icon:before {
      vertical-align: middle;
    }
    &:hover {
      // background: #ebf6fe;
    }
  }
  .logout {
    flex: 6;
    height: 36px;
    background: rgba(33, 150, 243, 0.1);
    color: #2196f3;
    border-radius: 36px;
    line-height: 36px;
    text-align: center;
    margin: 16px 8px 16px 16px;
    .icon:before {
      vertical-align: middle;
    }
    &:hover {
      background: #ebf6fe;
    }
  }
  .userImage {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    cursor: pointer;
    position: relative;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }
    .hoverAvatar {
      display: none;
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.4);
      text-align: center;
      line-height: 60px;
      color: #ffffff;
      z-index: 2;
    }
    &:hover {
      .hoverAvatar {
        display: block;
      }
    }
  }
`;

const mapStateToProps = ({ sheet, sheetList, appPkg }) => ({ sheet, appPkg, sheetList, appStatus: appPkg.appStatus });
const mapDispatchToProps = dispatch => ({
  syncAppDetail: detail => dispatch(syncAppDetail(detail)),
  updateColor: color => dispatch(changeAppColor(color)),
  updateAppGroup: data => dispatch(updateAppGroup(data)),
  updateSheetListLoading: data => dispatch(updateSheetListLoading(data)),
});
@connect(mapStateToProps, mapDispatchToProps)
export default class PortalAppHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      appId: '',
      data: null,
      icon: '',
      name: '',
      iconColor: '',
      showUserInfo: false,
      showUserInfoDialog: false,
      currentData: [],
      avatar: md.global.Account.avatar,
      appSectionDetail: [],
      appSectionId: '',
      isAppItemOverflow: false,
      disabledPointer: 'left',
      showTelDialog: false,
      showDelDialog: false,
      allowExAccountDiscuss: false, //允许外部用户讨论
      exAccountDiscussEnum: 0, //外部用户的讨论类型 0：所有讨论 1：不可见内部讨论
    };
    if (!browserIsMobile()) {
      const { groupId, worksheetId } = getIds(props) || {};
      if (!worksheetId && !groupId) {
        this.completePara();
      }
    }
  }

  componentDidMount() {
    this.getInfo();
  }

  componentWillReceiveProps(nextProps) {
    if (!browserIsMobile()) {
      const { groupId, worksheetId } = getIds(nextProps) || {};
      if (!worksheetId && !groupId) {
        this.completePara();
      }
    }
  }

  /**
   * 参数补齐
   */
  completePara = () => {
    const appId = this.props.appId || this.props.match.params.appId;
    api.getAppFirstInfo({ appId }).then(({ appSectionId, workSheetId }) => {
      if (appSectionId) {
        this.setState({
          appSectionId,
        });
        navigateTo(`/app/${appId}/${appSectionId}/${workSheetId}`, true);
      } else {
        this.props.updateSheetListLoading(false);
      }
    });
  };

  buildFavicon({ iconUrl, iconColor }) {
    fetch(iconUrl)
      .then(res => res.text())
      .then(data => {
        data = btoa(data.replace(/fill=\".*?\"/g, '').replace(/\<svg/, `<svg fill="${iconColor}"`));
        $('[rel="icon"]').attr('href', `data:image/svg+xml;base64,${data}`);
      });
  }

  getInfo = () => {
    const { name, syncAppDetail } = this.props;
    if (!name) {
      api.getAppDetail({ appId: this.props.appId || this.props.match.params.appId }, { silent: true }).then(data => {
        this.setState({
          iconUrl: data.iconUrl,
          name: data.name,
          iconColor: data.iconColor,
          data,
        });
        syncAppDetail(
          _.pick(data, [
            'iconColor',
            'projectId',
            'name',
            'id',
            'fixed',
            'appDisplay',
            'webMobileDisplay',
            'pcDisplay',
            'fixRemark',
            'fixAccount',
            'permissionType',
          ]),
        );
        window.appInfo = data;
        this.buildFavicon(data);
      });
    }
    api.getAppInfo({ appId: this.props.appId || this.props.match.params.appId }).then(data => {
      this.props.updateAppGroup(data);
      const { appSectionDetail = [] } = data;
      this.setState({
        appSectionDetail,
      });
    });
    getDetail({
      exAccountId: md.global.Account.accountId,
      appId: this.props.appId || this.props.match.params.appId,
    }).then(res => {
      const avatarData = res.receiveControls.find(o => o.controlId === 'portal_avatar') || {};
      this.setState(
        {
          currentData: res.receiveControls,
          avatar: avatarData.value || md.global.Account.avatar,
        },
        () => {
          md.global.Account.avatar = avatarData.value || md.global.Account.avatar;
        },
      );
    });
  };

  logout = () => {
    window.currentLeave = true;
    login.loginOut().then(data => {
      if (data) {
        removePssId();
        window.localStorage.removeItem('LoginCheckList'); // accountId 和 encryptPassword 清理掉
        const appId = this.props.appId || this.props.match.params.appId;
        const url = `${location.origin}${window.subPath || ''}/app/${appId}`;
        location.href = `${window.subPath || ''}/login?ReturnUrl=${encodeURIComponent(url)}`; // 跳转到登录
      }
    });
  };
  //编辑详细资料
  handleUploadImg = () => {
    if (browserIsMobile()) {
      return;
    }
    const options = {
      container: {
        content: '',
        yesText: null,
        noText: null,
        header: _l('上传头像'),
      },
      dialogBoxID: 'uploadAvatorDialogId',
      width: '460px',
      height: '365px',
    };
    const { currentData, avatar = '' } = this.state;
    ReactDom.render(
      <DialogLayer {...options}>
        <AvatorInfo
          editAvatar={res => {
            ///更新数据 /////
            saveUserDetail({
              appId: this.props.appId || this.props.match.params.appId,
              exAccountId: md.global.Account.accountId,
              newCell: currentData
                .filter(o => ['avatar'].includes(o.alias))
                .map(o => {
                  return { ...o, value: res.fileName };
                }),
            }).then(res => {
              this.setState({ avatar: res.data.portal_avatar }, () => {
                md.global.Account.avatar = res.data.portal_avatar;
                $('#uploadAvatorDialogId_container,#uploadAvatorDialogId_mask').remove();
              });
            });
          }}
          avatar={avatar.split('imageView2')[0]}
          closeDialog={() => {}}
        />
      </DialogLayer>,
      document.createElement('div'),
    );
  };

  //头像和徽章
  getUserInfo() {
    return account.getAccountListInfo({});
  }

  render() {
    const {
      iconUrl,
      name,
      iconColor = '#2196f3',
      showUserInfo,
      showUserInfoDialog,
      currentData,
      data,
      showTelDialog,
      showDelDialog,
    } = this.state;
    const { isMobile, match = {}, appStatus, noAvatar } = this.props;
    const info = currentData.filter(
      o => !['name', 'mobilephone', 'avatar', 'firstLoginTime', 'roleid', 'status', 'openid'].includes(o.alias),
    );
    const { params = {} } = match;
    const color = this.props.iconColor || iconColor;
    const icon = this.props.iconUrl || iconUrl;
    const { fixed, pcDisplay } = data || {};
    return (
      <WrapHeader>
        <div
          className={cx('appNameHeaderBoxPortal appNameHeaderBox flexRow', { noBorder: isMobile, isMobile })}
          style={
            !isMobile
              ? {
                  backgroundColor: color,
                }
              : {}
          }
        >
          <React.Fragment>
            {!browserIsMobile() && (
              <div className="appIconWrap">
                {icon && color && (
                  <span
                    className="appIconWrapIcon"
                    style={
                      isMobile
                        ? {}
                        : {
                            backgroundColor: color,
                          }
                    }
                  >
                    <SvgIcon url={icon} fill={!isMobile ? '#fff' : color} size={24} />
                  </span>
                )}
              </div>
            )}
            <div className="headerCenter">
              <div
                className={cx('appName Font16 Hand', { appNameM: isMobile, isFixed: fixed })}
                style={{ color: isMobile ? '#333' : '#fff' }}
              >
                {this.props.name || name}
              </div>
              {fixed && !pcDisplay && <div className="appFixed">{_l('维护中')}</div>}
              {!isMobile && !fixed && !pcDisplay && (
                <AppGroup appStatus={appStatus} {...this.props} {..._.pick(data, ['permissionType', 'isLock'])} />
              )}
            </div>
            <PortalMessage color={color} isMobile={isMobile} />
            {!noAvatar && (
              <div
                className={cx('InlineBlock mRight16 Hand', { avatarM: isMobile })}
                ref={avatar => {
                  this.avatar = avatar;
                }}
                onClick={() =>
                  this.setState({
                    showUserInfo: true,
                  })
                }
              >
                <img
                  src={(this.state.avatar || '').split('imageView2')[0]}
                  style={{ width: isMobile ? 32 : 24, height: isMobile ? 32 : 24, borderRadius: '50%' }}
                />
              </div>
            )}
          </React.Fragment>
        </div>
        {showUserInfo && <div className="cover"></div>}
        {showUserInfo && (
          <ClickAwayable
            className={''}
            onClickAway={() => this.setState({ showUserInfo: false })}
            // 知识文件选择层 点击时不收起
            onClickAwayExceptions={['#uploadAvatorDialogId,.mui-dialog-container,.rc-trigger-popup']}
          >
            <CSSTransitionGroup
              component={'div'}
              transitionName={'userInfoSide'}
              transitionAppearTimeout={500}
              transitionEnterTimeout={500}
              transitionLeaveTimeout={500}
            >
              {
                <Wrap className={cx({ isMobile })}>
                  {isMobile && (
                    <React.Fragment>
                      <span
                        className="Font17 Hand InlineBlock back pLeft16"
                        onClick={() => {
                          this.setState({ showUserInfo: false });
                        }}
                      >
                        <Icon icon="backspace mRight8 Gray_9e" />
                        {_l('我的账户')}
                      </span>
                    </React.Fragment>
                  )}
                  <div className="infoConBox">
                    <div className="account flexRow">
                      <div className="userImage" onClick={this.handleUploadImg}>
                        <img
                          className="avatarImg"
                          src={(this.state.avatar || '').split('imageView2')[0]}
                          style={{ width: 56, height: 56, borderRadius: '50%' }}
                        />
                        {!browserIsMobile() && (
                          <div className="hoverAvatar">
                            <span className="Font20 icon-upload_pictures"></span>
                          </div>
                        )}
                      </div>
                      <span className="userName flex mLeft20 Font17">
                        {(currentData.find(o => o.alias === 'name') || {}).value}
                      </span>
                      {/* <Icon
                      icon="clear_1"
                      className="closeBtnN Font18 Hand"
                      onClick={() => {
                        this.setState({
                          showUserInfo: false,
                        });
                      }}
                    /> */}
                    </div>
                    <div className={cx('tel flexRow mTop32')}>
                      <span className="title InlineBlock Gray_9e">{_l('手机号')}</span>
                      <span className="telNumber flex">
                        {(currentData.find(o => o.alias === 'mobilephone') || {}).value}
                        <span
                          className="edit ThemeColor3 Hand mLeft10 InlineBlock"
                          onClick={() => {
                            this.setState({
                              showTelDialog: true,
                            });
                          }}
                        >
                          {_l('修改')}
                        </span>
                      </span>
                    </div>
                    <h6 className={cx('Font16', { mTop32: !isMobile, mTop24: isMobile })}>{_l('我的信息')}</h6>
                    <div className="infoBox">
                      {info
                        .sort((a, b) => {
                          return a.row - b.row;
                        })
                        .map(o => {
                          return (
                            <div className="tel flexRow mTop10">
                              <span className="title InlineBlock Gray_9e WordBreak">{o.controlName}</span>
                              <span className={cx('flex mLeft24 rInfo', { isOption: [9, 10, 11].includes(o.type) })}>
                                {renderText({ ...o })}
                              </span>
                            </div>
                          );
                        })}
                      <span
                        className="edit ThemeColor3 Hand mTop6 InlineBlock"
                        onClick={() => {
                          this.setState({
                            showUserInfoDialog: true,
                          });
                        }}
                      >
                        {_l('修改')}
                      </span>
                    </div>
                  </div>
                  <div className="logoutBox">
                    <div
                      className="logout Hand Font14 Bold"
                      onClick={() => {
                        this.logout();
                      }}
                    >
                      <Icon icon="exit_to_app" className="mRight5 Font18" />
                      {_l('安全退出')}
                    </div>

                    <div
                      className="del Hand Font14 Bold"
                      onClick={() => {
                        this.setState({
                          showDelDialog: true,
                        });
                      }}
                    >
                      {_l('注销账户')}
                    </div>
                  </div>
                </Wrap>
              }
            </CSSTransitionGroup>
          </ClickAwayable>
        )}
        {showUserInfoDialog && (
          <UserInfoDialog
            appId={this.props.appId || this.props.match.params.appId}
            classNames={browserIsMobile() ? 'forMobilePortal' : ''}
            show={showUserInfoDialog}
            currentData={currentData
              .filter(o => !['avatar', 'firstLoginTime', 'roleid', 'status'].includes(o.alias))
              .map(o => {
                if (['portal_mobile'].includes(o.controlId)) {
                  return { ...o, disabled: true };
                } else {
                  return o;
                }
              })}
            exAccountId={md.global.Account.accountId}
            setShow={() => this.setState({ showUserInfoDialog: false })}
            onOk={(data, ids) => {
              ///更新数据 /////
              saveUserDetail({
                appId: this.props.appId || this.props.match.params.appId,
                exAccountId: md.global.Account.accountId,
                newCell: data.filter(o => ids.includes(o.controlId)).map(formatControlToServer),
              }).then(res => {
                this.setState({ showUserInfoDialog: false, currentData: data });
              });
            }}
          />
        )}
        {showTelDialog && (
          //更换手机号
          <TelDialog
            appId={this.props.appId || this.props.match.params.appId}
            classNames={browserIsMobile() ? 'forMobilePortal' : ''}
            show={showTelDialog}
            data={currentData.find(o => ['portal_mobile'].includes(o.controlId)).value}
            exAccountId={md.global.Account.accountId}
            setShow={() => this.setState({ showTelDialog: false })}
            onOk={() => {
              this.logout();
            }}
          />
        )}
        {showDelDialog && (
          //更换手机号
          <DelDialog
            appId={this.props.appId || this.props.match.params.appId}
            classNames={browserIsMobile() ? 'forMobilePortal' : ''}
            show={showDelDialog}
            data={currentData.find(o => ['portal_mobile'].includes(o.controlId)).value}
            exAccountId={md.global.Account.accountId}
            setShow={() => this.setState({ showDelDialog: false })}
            onOk={(data, ids) => {}}
          />
        )}
      </WrapHeader>
    );
  }
}
