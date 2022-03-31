import React, { Component, Fragment } from 'react';
import { string } from 'prop-types';
import { Icon, Tooltip } from 'ming-ui';
import Avatar from '../Avatar';
import GlobalSearch from '../GlobalSearch';
import UserMenu from '../UserMenu';
import AddMenu from '../AddMenu';
import MyProcessEntry from 'src/pages/workflow/MyProcess/Entry';
import MyProcess from 'src/pages/workflow/MyProcess';
import './index.less';
import cx from 'classnames'
import { getAppFeaturesVisible } from 'src/util';

const isHome = location.pathname.indexOf('app/my') !== -1;
const { app: { commonUserHandle: {help} }} = window.private
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

  renderHeaderSearch = () => {
    const { type } = this.props;
    if (_.includes(['appPkg'], type)) {
      return (
        <div className="appPkgHeaderSearch" data-tip={_l('搜索')}>
          <Icon icon="search" className="Font20" onClick={() => this.setState({ globalSearchVisible: true })} />
        </div>
      );
    }
    if (_.includes(['native'], type)) {
      return (
        <Fragment>
          <Tooltip text={<AddMenu />} action={['click']} mouseEnterDelay={0.2} themeColor="white" tooltipClass="pAll0">
            <div className="addOperationIconWrap mLeft20 mRight15 pointer">
              <Icon icon="addapplication Font30" />
            </div>
          </Tooltip>
          <form className="nativeHeaderForm" autoComplete="off">
            <Icon icon="search" className="searchIcon Font20" />
            <input
              type="text"
              className="globalSearch"
              onFocus={() => this.setState({ globalSearchVisible: true })}
              placeholder={_l('智能搜索(F)...')}
              autoComplete="off"
            />
          </form>
        </Fragment>
      );
    }
    return (
      <Fragment>
        <Icon icon="search" className="searchIcon Font17" />
        <form autoComplete="off">
          <input
            type="text"
            className="globalSearch"
            onFocus={() => this.setState({ globalSearchVisible: true })}
            placeholder={_l('智能搜索(F)...')}
            autoComplete="off"
          />
        </form>
      </Fragment>
    );
  };

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
        {this.renderHeaderSearch()}
        {type ? (
          <MyProcessEntry
            type={type}
            countData={countData}
            onClick={() => {
              this.setState({ myProcessVisible: true });
            }}
            updateCountData={countData => {
              this.setState({ countData });
            }}
          />
        ) : null}
        <div
          className={cx("workflowHelpIconWrap pointer", {Visibility: help, mAll0: help})}
          data-tip={_l('帮助')}
          onClick={() => window.KF5SupportBoxAPI && window.KF5SupportBoxAPI.open()}
        >
          <Icon icon="workflow_help" className="helpIcon Font18" />
        </div>
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
            <Avatar src={md.global.Account.avatar.replace(/w\/100\/h\/100/, 'w/90/h/90')} size={30} />
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
