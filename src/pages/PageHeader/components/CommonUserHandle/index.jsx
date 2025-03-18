import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { string } from 'prop-types';
import { Icon, Tooltip, MdLink } from 'ming-ui';
import styled from 'styled-components';
import Avatar from '../Avatar';
import UserMenu from '../UserMenu';
import AddMenu from '../AddMenu';
import MyProcessEntry from '../MyProcessEntry';
import CreateAppItem from './CreateAppItem';
import HelpCollection from './HelpCollection';
import { canEditApp, canEditData } from 'src/pages/worksheet/redux/actions/util.js';
import './index.less';
import { getAppFeaturesVisible } from 'src/util';
import _ from 'lodash';
import GlobalSearch from '../GlobalSearch/index';
import { withRouter } from 'react-router-dom';
import appManagementApi from 'src/api/appManagement';
import privateSysSettingApi from 'src/api/privateSysSetting';
import { VerticalMiddle } from 'worksheet/components/Basics';
import cx from 'classnames';
import { hasBackStageAdminAuth } from 'src/components/checkPermission';
import LanguageList from '../LanguageList';
import Trigger from 'rc-trigger';
import HapAiDialog from './HapAiDialog';
import hapAI from './images/hapAI.png';
import { getHelpUrl } from 'src/common/helpUrls';

const BtnCon = styled.div`
  cursor: pointer;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 28px;
  height: 28px;
  border-radius: 28px;
  margin: 0 5px;
  .icon {
    font-size: 20px;
    color: rgb(0, 0, 0, 0.6);
  }
  &:hover {
    background: #f5f5f5;
    &.isDashboard {
      background: #fff;
    }
  }
`;

const AdminEntry = styled(VerticalMiddle)`
  cursor: pointer;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 28px;
  height: 28px;
  border-radius: 28px;
  margin: 0 5px;
  .icon {
    font-size: 20px;
    color: rgb(0, 0, 0, 0.6);
  }
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

const EntryWrap = styled.div`
  height: 32px;
  line-height: 32px;
  border-radius: 20px 20px 20px 20px;
  padding: 0 10px;
  cursor: pointer;
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

const HapAi = styled.div`
  height: 32px;
  border-radius: 16px;
  padding: 6px 15px 0;
  cursor: pointer;
  .hapAI {
    width: 20px;
    height: 20px;
  }
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

@withRouter
export default class CommonUserHandle extends Component {
  static propTypes = {
    type: string,
    currentProject: PropTypes.shape({}),
  };
  state = {
    globalSearchVisible: false,
    userVisible: false,
    newVersion: null,
  };

  componentDidMount() {
    if (md.global.SysSettings.enablePromptNewVersion && md.global.Account.superAdmin) {
      privateSysSettingApi.getNewVersionInfo().then(data => {
        this.setState({ newVersion: data });
      });
    }
  }

  handleUserVisibleChange(visible) {
    this.setState({
      userVisible: visible,
    });
  }

  openGlobalSearch() {
    this.setState({ globalSearchVisible: true });
    GlobalSearch({
      match: this.props.match,
      onClose: () => this.setState({ globalSearchVisible: false }),
    });
  }

  handleAddMenuVisible(visible) {
    this.setState({
      addMenuVisible: visible,
    });
  }

  render() {
    const { globalSearchVisible, userVisible, popupVisible, showHapAi, newVersion } = this.state;
    const { type, currentProject = {} } = this.props;
    const hasProjectAdminAuth =
      currentProject.projectId &&
      currentProject.projectId !== 'external' &&
      hasBackStageAdminAuth({ projectId: currentProject.projectId });

    // 获取url参数
    const { tr, ss, ac } = getAppFeaturesVisible();
    if (window.isPublicApp || !tr) {
      return null;
    }

    return (
      <div className={cx('commonUserHandleWrap', { dashboardCommonUserHandleWrap: type === 'dashboard' })}>
        {type === 'native' && (
          <React.Fragment>
            <Tooltip
              popupVisible={this.state.addMenuVisible}
              text={
                <AddMenu
                  onClose={() => {
                    this.setState({ addMenuVisible: false });
                  }}
                />
              }
              action={['click']}
              mouseEnterDelay={0.2}
              themeColor="white"
              tooltipClass="pAll0"
              onPopupVisibleChange={this.handleAddMenuVisible.bind(this)}
            >
              <div className="addOperationIconWrap mLeft20 mRight15 pointer">
                <Icon icon="addapplication Font30" />
              </div>
            </Tooltip>
            <MyProcessEntry type={type} />
          </React.Fragment>
        )}

        {ss && type === 'appPkg' && (
          <React.Fragment>
            <div className="appPkgHeaderSearch tip-bottom-left" data-tip={_l('超级搜索(F)')}>
              <Icon icon="search" className="Font20" onClick={this.openGlobalSearch.bind(this)} />
            </div>
            {md.global.Config.IsLocal ? (
              !md.global.SysSettings.hideHelpTip ? (
                <div
                  className="workflowHelpIconWrap pointer"
                  data-tip={_l('帮助')}
                  onClick={() => window.open(getHelpUrl('common', 'mainHelp'))}
                >
                  <Icon icon="workflow_help" className="helpIcon Font20" />
                </div>
              ) : (
                ''
              )
            ) : (
              <Trigger
                action={['click']}
                popupVisible={popupVisible}
                onPopupVisibleChange={popupVisible => this.setState({ popupVisible })}
                popup={
                  <HelpCollection
                    hapAIPosition="top"
                    updatePopupVisible={popupVisible => this.setState({ popupVisible })}
                  />
                }
                popupAlign={{
                  points: ['tr', 'br'],
                  offset: [20, 11],
                  overflow: { adjustX: true, adjustY: true },
                }}
              >
                <div
                  className="workflowHelpIconWrap pointer"
                  data-tip={_l('帮助')}
                  onClick={() => this.setState({ popupVisible: true })}
                >
                  <Icon icon="workflow_help" className="helpIcon Font20" />
                </div>
              </Trigger>
            )}
          </React.Fragment>
        )}

        {type !== 'appPkg' && (
          <React.Fragment>
            {type !== 'dashboard' && (
              <BtnCon
                onClick={this.openGlobalSearch.bind(this)}
                data-tip={_l('超级搜索(F)')}
                className="tip-bottom-left"
              >
                <Icon icon="search" />
              </BtnCon>
            )}

            {!md.global.Config.IsLocal && type === 'dashboard' && (
              <HapAi onClick={() => this.setState({ showHapAi: true })}>
                <img className="hapAI" src={hapAI} />
                <span className="Gray_75 mLeft6">{_l('HAP助手')}</span>
              </HapAi>
            )}

            {md.global.Config.IsLocal && !md.global.SysSettings.hideHelpTip && (
              <EntryWrap onClick={() => window.open(getHelpUrl('common', 'mainHelp'))}>
                <Icon icon="workflow_help" className="helpIcon Font20 Gray_75 TxtMiddle" />
                <span className="Gray_75 mLeft5 TxtMiddle">{_l('帮助')}</span>
              </EntryWrap>
            )}
            {!md.global.Config.IsLocal && (
              <Trigger
                action={['click']}
                popupVisible={popupVisible}
                onPopupVisibleChange={popupVisible => this.setState({ popupVisible })}
                popup={
                  <HelpCollection
                    hapAIPosition="top"
                    updatePopupVisible={popupVisible => this.setState({ popupVisible })}
                  />
                }
                popupAlign={{
                  points: ['tr', 'br'],
                  offset: [40, 9],
                  overflow: { adjustX: true, adjustY: true },
                }}
              >
                <EntryWrap onClick={() => this.setState({ popupVisible: true })}>
                  <Icon icon="workflow_help" className="helpIcon Font20 Gray_75 TxtMiddle" />
                  <span className="Gray_75 mLeft5 TxtMiddle">{_l('帮助')}</span>
                </EntryWrap>
              </Trigger>
            )}

            {type === 'dashboard' && hasProjectAdminAuth && (
              <MdLink to={`/admin/home/${currentProject.projectId}`}>
                <EntryWrap>
                  <i className="icon icon-business Font20 Gray_75 TxtMiddle"></i>
                  <span className="Gray_75 mLeft5 TxtMiddle">{_l('组织管理')}</span>
                </EntryWrap>
              </MdLink>
            )}
            {type === 'dashboard' && newVersion && (
              <AdminEntry
                data-tip={_l('发现新版本：%0，点击查看', newVersion)}
                className="tip-bottom-left"
                onClick={() => window.open('https://docs-pd.mingdao.com/version')}
              >
                <Icon icon="score-up" className="Font20" style={{ color: '#20CA86' }} />
              </AdminEntry>
            )}
            {/*<BtnCon
              className={cx(`${type === 'native' ? 'mLeft10' : ''}`, { isDashboard: type === 'dashboard' })}
              data-tip={_l('帮助')}
              onClick={() => window.KF5SupportBoxAPI && window.KF5SupportBoxAPI.open()}
            >
              <Icon icon="workflow_help" />
            </BtnCon>*/}
          </React.Fragment>
        )}

        {ac && (
          <Tooltip
            text={<UserMenu handleUserVisibleChange={this.handleUserVisibleChange.bind(this)} />}
            action={['click']}
            themeColor="white"
            tooltipClass="pageHeadUser commonHeaderUser Normal"
            getPopupContainer={() => this.avatar}
            popupPlacement="bottom"
            offset={[-110, 0]}
            popupVisible={userVisible}
            onPopupVisibleChange={this.handleUserVisibleChange.bind(this)}
          >
            <div
              ref={avatar => {
                this.avatar = avatar;
              }}
            >
              <span className="tip-bottom-left mLeft16" data-tip={md.global.Account.fullname}>
                <Avatar src={md.global.Account.avatar} size={30} />
              </span>
            </div>
          </Tooltip>
        )}

        {showHapAi && <HapAiDialog visible={showHapAi} onCancel={() => this.setState({ showHapAi: false })} />}
      </div>
    );
  }
}

@withRouter
export class LeftCommonUserHandle extends Component {
  static propTypes = {
    type: string,
  };
  state = {
    globalSearchVisible: false,
    userVisible: false,
    roleEntryVisible: true,
  };

  componentDidMount() {
    const { id, permissionType, isLock } = this.props.data;
    if (!canEditData(permissionType) && !canEditApp(permissionType, isLock)) {
      appManagementApi
        .getAppRoleSetting({
          appId: id,
        })
        .then(data => {
          const { appSettingsEnum } = data;
          this.setState({ roleEntryVisible: appSettingsEnum === 1 });
        });
    }
  }

  handleUserVisibleChange(visible) {
    this.setState({
      userVisible: visible,
    });
  }
  openGlobalSearch() {
    this.setState({ globalSearchVisible: true });
    GlobalSearch({
      match: this.props.match,
      onClose: () => this.setState({ globalSearchVisible: false }),
    });
  }

  render() {
    const { userVisible, roleEntryVisible, popupVisible } = this.state;
    const { data, sheet, match } = this.props;
    const { projectId, id, permissionType, isLock, appStatus, sourceType } = data;
    const isUpgrade = appStatus === 4;
    // 获取url参数
    const { tr, ss, ac } = getAppFeaturesVisible();
    if (window.isPublicApp || !tr) {
      return null;
    }
    return (
      <div className="commonUserHandleWrap leftCommonUserHandleWrap w100">
        {!isUpgrade && (
          <Fragment>
            <CreateAppItem
              isCharge={sheet.isCharge}
              appId={id}
              groupId={match.params.groupId}
              worksheetId={match.params.worksheetId}
              projectId={projectId}
            >
              <div className="headerColorSwitch">
                <Icon icon="add" className="Font20 pointer" />
              </div>
            </CreateAppItem>
            {_.includes([1, 5], appStatus) && !md.global.Account.isPortal && (
              <Fragment>
                {!window.isPublicApp && canEditApp(permissionType, isLock) && (
                  <MdLink data-tip={_l('工作流')} className="tip-top" to={`/app/${id}/workflow`}>
                    <Icon icon="workflow" className="Font20 headerColorSwitch" />
                  </MdLink>
                )}
                {roleEntryVisible && (
                  <MdLink data-tip={_l('用户')} className="tip-top" to={`/app/${id}/role`}>
                    <Icon icon="group" className="Font20 headerColorSwitch" />
                  </MdLink>
                )}
              </Fragment>
            )}
          </Fragment>
        )}
        {/*ss && type === 'appPkg' && (
          <div className="headerColorSwitch tip-top pointer" data-tip={_l('超级搜索(F)')}>
            <Icon icon="search" className="Font20" onClick={this.openGlobalSearch.bind(this)} />
          </div>
        )*/}
        <LanguageList
          placement={canEditApp(permissionType, isLock) ? 'top' : 'topLeft'}
          app={data}
          isCharge={canEditApp(permissionType, sourceType === 60 ? false : isLock)}
        >
          <div className="headerColorSwitch tip-top pointer" data-tip={_l('应用语言')}>
            <Icon icon="language" className="Font20" />
          </div>
        </LanguageList>
        {/*
        <Trigger
          action={['click']}
          popupVisible={popupVisible}
          onPopupVisibleChange={popupVisible => this.setState({ popupVisible })}
          popup={
            <HelpCollection
              hapAIPosition="bottom"
              updatePopupVisible={popupVisible => this.setState({ popupVisible })}
            />
          }
          popupAlign={{
            points: ['tr', 'br'],
            offset: [-30, -30],
            overflow: { adjustX: true, adjustY: true },
          }}
        >
          <Icon icon="workflow_help" className="Font20" />
        </div> */}
        {ac && (
          <Tooltip
            text={
              <UserMenu
                handleUserVisibleChange={this.handleUserVisibleChange.bind(this)}
                leftCommonUserHandleWrap={true}
              />
            }
            action={['click']}
            themeColor="white"
            tooltipClass="pageHeadUser"
            getPopupContainer={() => this.avatar}
            offset={[160, 50]}
            popupVisible={userVisible}
            onPopupVisibleChange={this.handleUserVisibleChange.bind(this)}
          >
            <div
              ref={avatar => {
                this.avatar = avatar;
              }}
            >
              <span className="tip-top" data-tip={md.global.Account.fullname}>
                <Avatar src={md.global.Account.avatar.replace(/w\/100\/h\/100/, 'w/90/h/90')} size={30} />
              </span>
            </div>
          </Tooltip>
        )}
      </div>
    );
  }
}
