import React, { Component } from 'react';
import { string } from 'prop-types';
import { Icon, Tooltip } from 'ming-ui';
import styled from 'styled-components';
import Avatar from '../Avatar';
import GlobalSearch from '../GlobalSearch';
import UserMenu from '../UserMenu';
import AddMenu from '../AddMenu';
import MyProcessEntry from 'src/pages/workflow/MyProcess/Entry';
import MyProcess from 'src/pages/workflow/MyProcess';
import './index.less';
import { getAppFeaturesVisible } from 'src/util';

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
export default class CommonUserHandle extends Component {
  static propTypes = {
    type: string,
  };
  state = {
    globalSearchVisible: false,
    myProcessVisible: false,
    countData: {},
    userVisible: false,
  };

  handleUserVisibleChange(visible) {
    this.setState({
      userVisible: visible,
    });
  }

  render() {
    const { globalSearchVisible, countData, myProcessVisible, userVisible } = this.state;
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
          <BtnCon onClick={() => this.setState({ globalSearchVisible: true })} data-tip={_l('搜索')}>
            <Icon icon="search" />
          </BtnCon>
        )}
        {type === 'appPkg' && (
          <div className="appPkgHeaderSearch" data-tip={_l('搜索')}>
            <Icon icon="search" className="Font20" onClick={() => this.setState({ globalSearchVisible: true })} />
          </div>
        )}
        {_.includes(['native', 'appPkg'], type) ? (
          <MyProcessEntry
            type={type}
            countData={countData}
            className={md.global.SysSettings.hideHelpTip ? 'mRight20' : ''}
            onClick={() => {
              this.setState({ myProcessVisible: true });
            }}
            updateCountData={countData => {
              this.setState({ countData });
            }}
          />
        ) : null}
        {/*type !== 'appPkg' && !md.global.SysSettings.hideHelpTip && (
          <BtnCon
            className={`mRight16 ${type === 'native' ? 'mLeft10' : ''}`}
            data-tip={_l('帮助')}
            onClick={() => window.KF5SupportBoxAPI && window.KF5SupportBoxAPI.open()}
          >
            <Icon icon="workflow_help" />
          </BtnCon>
        )*/}
        {/*type === 'appPkg' && !md.global.SysSettings.hideHelpTip && (
          <div
            className="workflowHelpIconWrap pointer"
            data-tip={_l('帮助')}
            onClick={() => window.KF5SupportBoxAPI && window.KF5SupportBoxAPI.open()}
          >
            <Icon icon="workflow_help" className="helpIcon Font20" />
          </div>
        )*/}
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
        {globalSearchVisible && <GlobalSearch onClose={() => this.setState({ globalSearchVisible: false })} />}
        {myProcessVisible && (
          <MyProcess
            countData={countData}
            onCancel={() => {
              this.setState({ myProcessVisible: false });
            }}
            updateCountData={countData => {
              this.setState({ countData });
            }}
          />
        )}
      </div>
    );
  }
}
