import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon, Skeleton, SvgIcon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import UpgradeContent from 'src/components/UpgradeContent';
import CommonUserHandle from 'src/pages/PageHeader/components/CommonUserHandle';
import HomepageIcon from 'src/pages/PageHeader/components/HomepageIcon';
import MyProcessEntry from 'src/pages/PageHeader/components/MyProcessEntry';

const Wrap = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  z-index: 1000;
  overflow: auto;
  .homepageIconWrap {
    isplay: flex;
    align-items: center;
    padding: 8px;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    margin: 0 5px 0 10px;
    cursor: pointer;
    width: max-content;
  }
  .appDetailWrap {
    position: relative;
    display: flex;
    height: 100%;
    align-items: center;
  }
  .appIconAndName {
    display: flex;
    height: 100%;
    align-items: center;
    cursor: pointer;
    color: #fff;
  }
  .appIconWrap {
    idth: 30px;
    height: 30px;
    border-radius: 4px;
    flex-shrink: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .appName {
    font-size: 18px;
    margin: 0 2px 0 6px;
  }
  .isUpgrade {
    border-radius: 13px;
    color: #fff;
    line-height: 22px;
    box-sizing: border-box;
    white-space: nowrap;
    font-weight: bold;
    padding: 0 10px;
    font-size: 12px;
    margin-left: 5px;
    background: #4caf50;
  }
  .appIntroWrap {
    margin: 2px 10px 0 0;
  }
  .count {
    color: #fff;
    border-radius: 20px;
    min-width: 20px;
    height: 20px;
    background-color: #f76d6d;
    width: auto;
    padding: 0 6px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .commonUserHandleWrap {
    display: flex;
    height: 100%;
    align-items: center;
    position: relative;
    flex-shrink: 0;
    padding: 0 20px 0 0;
  }
  .appPkgHeaderSearch,
  .workflowHelpIconWrap {
    width: 27px;
    height: 27px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
  }
  .appPkgHeaderSearch {
    cursor: pointer;
  }
  .workflowHelpIconWrap {
    margin-left: 15px;
  }
  .appPkgHeaderWrap .commonUserHandleWrap .appPkgHeaderSearch .icon,
  .appPkgHeaderWrap .commonUserHandleWrap .workflowHelpIconWrap .icon {
    color: #fff;
  }
  &.commonWrap {
    .appPkgHeaderWrap {
      height: 50px;
      display: flex;
      align-items: center;
      height: 50px;
      justify-content: space-between;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.24);
    }
    .appName {
      margin: 0 2px;
      font-size: 15px;
      font-weight: bold;
      max-width: 200px;
    }
  }
  &.leftWrap {
    .appPkgHeaderWrap {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .loadingSkeleton {
      opacity: 0.8;
      background-color: transparent;
    }
    .commonUserHandleWrap {
      height: 50px;
      justify-content: space-around;
      padding: 10px;
      width: 100%;
      box-sizing: border-box;
    }
  }
`;

export default class UpgradeStatus extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  changeIndexVisible = (visible = true) => {
    this.timer = setTimeout(() => {
      if (window.disabledSideButton) return;
      this.setState({ indexSideVisible: visible });
    }, 100);
  };

  renderHomepageIconWrap = () => {
    return (
      <div
        className="homepageIconWrap"
        onClick={() => {
          window.disabledSideButton = false;
          this.changeIndexVisible();
        }}
        onMouseEnter={this.changeIndexVisible}
        onMouseLeave={() => {
          window.disabledSideButton = false;
          clearTimeout(this.timer);
        }}
      >
        <HomepageIcon />
      </div>
    );
  };
  renderAppDetailWrap = ({ themeType, iconUrl, pcNaviStyle, name, description, iconColor }) => {
    return (
      <Fragment>
        <div className={cx('appDetailWrap pointer overflowHidden')}>
          <div className="appIconAndName pointer overflow_ellipsis">
            <div className="appIconWrap">
              <SvgIcon
                url={iconUrl}
                fill={['black', 'light'].includes(themeType) ? iconColor : '#FFF'}
                size={pcNaviStyle === 1 ? 28 : 24}
              />
            </div>
            <span className="appName overflow_ellipsis">{name}</span>
          </div>
        </div>
        <div className="isUpgrade">{_l('升级中')}</div>
        {description && (
          <Tooltip title={pcNaviStyle === 1 ? '' : _l('应用说明')}>
            <div className="appIntroWrap pointer">
              <Icon className="appIntroIcon Font16" icon="info" />
            </div>
          </Tooltip>
        )}
      </Fragment>
    );
  };

  renderAppInfoWrap = () => {
    const { appPkg = {} } = this.props;
    const { pcNaviStyle, appStatus } = appPkg;

    if (pcNaviStyle === 1) {
      const renderContent = ({ count, waitingExamine }, onClick) => {
        if (appStatus === 4) {
          return <div className="flexRow alignItemsCenter pointer White backlogWrap"></div>;
        }

        return (
          <div className="flexRow alignItemsCenter pointer White backlogWrap" onClick={onClick}>
            <Icon icon="task_alt" className="Font18" />
            <div className="mLeft5 mRight5 bold">{_l('待办')}</div>
            {!!count && <div className="count">{count}</div>}
            {!!waitingExamine && !count && <div className="weakCount"></div>}
          </div>
        );
      };
      return (
        <div className="appInfoWrap flexColumn pLeft10 pRight10 mBottom8">
          <div className="flexRow alignItemsCenter pTop10">
            <div className="flex">{this.renderHomepageIconWrap()}</div>
            <MyProcessEntry type="appPkg" renderContent={renderContent} />
          </div>
          <div className="flexRow alignItemsCenter pTop10 Relative">{this.renderAppDetailWrap(appPkg)}</div>
        </div>
      );
    } else {
      return (
        <div className="appInfoWrap flexRow alignItemsCenter">
          {this.renderHomepageIconWrap()}
          {this.renderAppDetailWrap(appPkg)}
        </div>
      );
    }
  };

  renderHeader = () => {
    const { appPkg } = this.props;
    const { pcNaviStyle, themeType, navColor } = appPkg;

    return (
      <div
        className={cx('appPkgHeaderWrap', themeType)}
        style={{
          backgroundColor: navColor,
          width: pcNaviStyle === 1 ? 240 : undefined,
        }}
      >
        {this.renderAppInfoWrap()}
        {pcNaviStyle === 1 && (
          <div className="LeftAppGroupWrap w100 flex">
            <Skeleton active={false} />
          </div>
        )}
        <CommonUserHandle type="appPkg" {...appPkg} />
      </div>
    );
  };

  render() {
    const { appPkg } = this.props;
    const { pcNaviStyle } = appPkg;
    if (pcNaviStyle === 1) {
      return (
        <Wrap className="leftWrap flexRow">
          {this.renderHeader()}
          <div className="flex" style={{ background: '#f5f5f5' }}>
            <UpgradeContent appPkg={appPkg} showLeftSkeleton={false} />
          </div>
        </Wrap>
      );
    }
    return (
      <Wrap className="flexColumn commonWrap">
        {this.renderHeader()}
        <UpgradeContent appPkg={appPkg} />
      </Wrap>
    );
  }
}
