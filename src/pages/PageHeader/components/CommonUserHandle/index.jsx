import React, { Component, Fragment } from 'react';
import { string } from 'prop-types';
import { Icon, Tooltip, MdLink } from 'ming-ui';
import styled from 'styled-components';
import Avatar from '../Avatar';
import UserMenu from '../UserMenu';
import AddMenu from '../AddMenu';
import MyProcessEntry from '../MyProcessEntry';
import CreateAppItem from './CreateAppItem';
import { canEditApp, canEditData } from 'src/pages/worksheet/redux/actions/util.js';
import './index.less';
import { getAppFeaturesVisible } from 'src/util';
import _ from 'lodash';
import GlobalSearch from '../GlobalSearch/index';
import { withRouter } from 'react-router-dom';

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
  }
`;

@withRouter
export default class CommonUserHandle extends Component {
  static propTypes = {
    type: string,
  };
  state = {
    globalSearchVisible: false,
    userVisible: false,
  };

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
    const { globalSearchVisible, userVisible } = this.state;
    const { type } = this.props;

    // 获取url参数
    const { tr } = getAppFeaturesVisible();
    if (window.isPublicApp || !tr) {
      return null;
    }

    return (
      <div className="commonUserHandleWrap">
        {type === 'native' && (
          <Tooltip text={<AddMenu />} action={['click']} mouseEnterDelay={0.2} themeColor="white" tooltipClass="pAll0">
            <div className="addOperationIconWrap mLeft20 mRight15 pointer">
              <Icon icon="addapplication Font30" />
            </div>
          </Tooltip>
        )}
        {!['appPkg'].includes(type) && (
          <BtnCon
            onClick={this.openGlobalSearch.bind(this)}
            data-tip={_l('超级搜索(F)')}
          >
            <Icon icon="search" />
          </BtnCon>
        )}
        {type === 'appPkg' && (
          <div className="appPkgHeaderSearch" data-tip={_l('超级搜索(F)')}>
            <Icon
              icon="search"
              className="Font20"
              onClick={this.openGlobalSearch.bind(this)}
            />
          </div>
        )}
        {_.includes(['native'], type) && (
          <MyProcessEntry type={type} />
        )}
        {/* {type !== 'appPkg' && (
          <BtnCon
            className={`mRight16 ${type === 'native' ? 'mLeft10' : ''}`}
            data-tip={_l('帮助')}
            onClick={() => window.KF5SupportBoxAPI && window.KF5SupportBoxAPI.open()}
          >
            <Icon icon="workflow_help" />
          </BtnCon>
        )} */}
        <Tooltip
          text={<UserMenu handleUserVisibleChange={this.handleUserVisibleChange.bind(this)} />}
          mouseEnterDelay={0.2}
          action={['click']}
          themeColor="white"
          tooltipClass="pageHeadUser commonHeaderUser"
          getPopupContainer={() => this.avatar}
          offset={[70, 0]}
          popupVisible={userVisible}
          onPopupVisibleChange={this.handleUserVisibleChange.bind(this)}
        >
          <div
            ref={avatar => {
              this.avatar = avatar;
            }}
          >
            <span className="tip-bottom-left" data-tip={md.global.Account.fullname}>
              <Avatar src={md.global.Account.avatar.replace(/w\/100\/h\/100/, 'w/90/h/90')} size={30} />
            </span>
          </div>
        </Tooltip>
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
  };

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
    const { globalSearchVisible, userVisible } = this.state;
    const { isAuthorityApp, type, data, sheet, match } = this.props;
    const { projectId, id, permissionType, isLock, appStatus, fixed, pcDisplay } = data;
    // 获取url参数
    const { tr } = getAppFeaturesVisible();
    if (window.isPublicApp || !tr) {
      return null;
    }

    return (
      <div className="commonUserHandleWrap leftCommonUserHandleWrap w100">
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
            {!(
              (pcDisplay || fixed) &&
              !(canEditApp(permissionType, isLock) || canEditData(permissionType))
            ) && (
              <MdLink data-tip={_l('用户')} className="tip-top" to={`/app/${id}/role`}>
                <Icon icon="group" className="Font20 headerColorSwitch" />
              </MdLink>
            )}
          </Fragment>
        )}
        {type === 'appPkg' && (
          <div className="headerColorSwitch tip-top pointer" data-tip={_l('超级搜索(F)')}>
            <Icon
              icon="search"
              className="Font20"
              onClick={this.openGlobalSearch.bind(this)}
            />
          </div>
        )}
        <div
          className="headerColorSwitch tip-top pointer"
          data-tip={_l('帮助')}
          onClick={() => window.KF5SupportBoxAPI && window.KF5SupportBoxAPI.open()}
        >
          <Icon icon="workflow_help" className="Font20" />
        </div>
        <Tooltip
          text={<UserMenu handleUserVisibleChange={this.handleUserVisibleChange.bind(this)} />}
          mouseEnterDelay={0.2}
          action={['click']}
          themeColor="white"
          tooltipClass="pageHeadUser"
          getPopupContainer={() => this.avatar}
          offset={[0, 0]}
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
      </div>
    );
  }
}
