import React, { Component, Fragment } from 'react';
import { Icon, Dialog, FunctionWrap } from 'ming-ui';
import cx from 'classnames';
import AddressBookInvite from './AddressBookInvite';
import MobileOrEmailInvite from './MobileOrEmailInvite';
import PublicLink from './PublicLink';
import DetailList from './DetailList';
import './index.less';
import _ from 'lodash';

// 0：好友  1：群组  2：任务  3：知识  4：网络 5：日程 6：项目
export const FROM_TYPE = {
  PERSONAL: 0, // 个人好友
  GROUPS: 1, // 群组
  NORMAL: 4, // 网络
};

const TAB_MODE = {
  PUBLIC_LINK: 1,
  MOBILE_EMAIL: 2,
  ADDRESS_BOOK: 3,
};

export const DETAIL_MODE = {
  NORMAL: 0,
  LINK: 1, // 使用链接
  INVITE: 2, // 邀请记录
};

const DETAIL_MODE_TEXT = {
  1: _l('查看使用中的链接'),
  2: _l('邀请记录'),
};

class AddFriends extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      selectTab: this.DEFAULT_TABS[0].value,
      isPayUsers: true,
      detailMode: 0, //
      url: '',
      code: '',
      tokens: [],
    };
  }

  get DEFAULT_TABS() {
    const { projectId } = this.props;
    const { Account: { projects = [] } = {}, SysSettings } = md.global;
    const { enableSmsCustomContent } = SysSettings;
    const project = _.find(projects, { projectId }) || {};
    const { isProjectAdmin, isProjectAppManager } = project;
    return [
      isProjectAdmin && isProjectAppManager ? { text: _l('公开邀请'), value: 1, subText: _l('链接添加') } : null,
      { text: !enableSmsCustomContent ?  _l('邮箱邀请') : _l('手机/邮箱邀请'), value: 2, subText: _l('搜索用户') },
      { text: _l('从通讯录邀请'), value: 3 },
    ].filter(_ => _);
  }

  componentDidMount() {
    const { Config: { IsLocal } = {}, Account: { projects = [] } = {} } = md.global;
    this.setState({
      isPayUsers: projects.some(item => item.licenseType !== 0) || IsLocal,
    });
  }

  setDetailMode = value => {
    this.setState({ detailMode: value });
  };

  setInfo = obj => {
    this.setState({ ...obj });
  };

  // 关闭弹层
  onCancel = () => {
    this.setState({ visible: false });
  };

  renderHeader = () => {
    const { fromType, fromText, projectId } = this.props;
    let content = '';

    if (fromType === FROM_TYPE.PERSONAL) {
      content = (
        <div className="headerText ellipsis">
          <span className="Gray_75">{_l('邀请用户为')}</span>
          <span className="mLeft3 mRight3">{_l('个人好友')}</span>
          <span className="Gray_75">({_l('非同事')})</span>
        </div>
      );
    } else {
      content = (
        <div className="headerText ellipsis w100 TxtCenter">
          <span className="Gray_75">{_l('邀请用户加入')}</span>
          <span className="mLeft3">
            {fromText ||
              _.get(
                _.find(md.global.Account.projects, i => i.projectId === projectId),
                'companyName',
              )}
          </span>
        </div>
      );
    }

    return (
      <div className="addFriendsHeader">
        <Icon icon="airplane" />
        {content}
      </div>
    );
  };

  renderTabs = () => {
    const { selectTab } = this.state;
    const { fromType } = this.props;
    const isPersonal = fromType === FROM_TYPE.PERSONAL;
    return (
      <ul className="AddFriends-head-navbar">
        {this.DEFAULT_TABS.map(tab => {
          return (isPersonal || fromType === FROM_TYPE.GROUPS) && tab.value === TAB_MODE.ADDRESS_BOOK ? null : (
            <li
              key={tab.value}
              onClick={() => this.setState({ selectTab: tab.value })}
              className={cx('AddFriends-head-navbar__item', {
                'AddFriends-head-navbar__item--active': selectTab === tab.value,
              })}
            >
              {isPersonal ? tab.subText : tab.text}
            </li>
          );
        })}
      </ul>
    );
  };

  renderContent = () => {
    const { selectTab, isPayUsers, url, code, tokens } = this.state;
    const options = {
      onCancel: this.onCancel,
      projectId: this.props.projectId,
      fromType: this.props.fromType,
      isPayUsers,
      setDetailMode: this.setDetailMode,
    };
    if (selectTab === TAB_MODE.PUBLIC_LINK) {
      return <PublicLink {...options} {...{ url, code, tokens, setInfo: this.setInfo }} />;
    } else if (selectTab === TAB_MODE.MOBILE_EMAIL) {
      return <MobileOrEmailInvite {...options} />;
    } else {
      return <AddressBookInvite {...options} />;
    }
  };

  render() {
    const { onClose } = this.props;
    const { isPayUsers, detailMode } = this.state;

    return (
      <Dialog
        className="dialogAddFriendsBox"
        width={640}
        visible={this.state.visible}
        title={null}
        footer={null}
        onCancel={onClose}
      >
        <div className="dialogAddFriendsContainer">
          {this.renderHeader()}
          {!isPayUsers && (
            <div class="safeWarning">
              {_l(
                '近期有不法分子利用平台进行诈骗活动。为了保障平台安全，暂时只允许付费组织中的用户发起邀请。对您使用造成的不便，深表歉意！',
              )}
            </div>
          )}
          {this.renderTabs()}
          {this.renderContent()}
        </div>

        <Dialog
          width={640}
          visible={detailMode}
          title={
            <div className="inviteBackIcon">
              <div className="iconBox" onClick={() => this.setDetailMode(DETAIL_MODE.NORMAL)}>
                <Icon icon="arrow_back" />
              </div>
              {DETAIL_MODE_TEXT[detailMode]}
            </div>
          }
          footer={null}
          onCancel={() => this.setDetailMode(DETAIL_MODE.NORMAL)}
        >
          <div className="dialogAddFriendsContainer pTop0" style={{ height: 510 }}>
            <DetailList detailMode={detailMode} {...this.props} />
          </div>
        </Dialog>
      </Dialog>
    );
  }
}

class SelectProject extends Component {
  constructor(props) {
    super(props);
  }

  defaultProps = {
    friendVisible: true,
  };

  onSelect(projectId) {
    FunctionWrap(AddFriends, { ...this.props, onClose: () => {}, fromType: projectId ? 4 : 0, projectId });
  }

  render() {
    const { friendVisible, onClose } = this.props;

    return (
      <Dialog className="inviteDialog" width={420} visible title={_l('邀请到')} footer={null} onCancel={onClose}>
        <div className="inviteList">
          <ul className="projectList">
            {md.global.Account.projects.concat(friendVisible ? { projectId: '' } : []).map((item, index) => {
              const type = (index % 5) + 2;

              return (
                <Fragment key={index}>
                  {!item.projectId && friendVisible && <li className="splitLine" />}

                  <li className="projectItem flexRow pointer" onClick={() => this.onSelect(item.projectId)}>
                    {item.projectId ? (
                      <Fragment>
                        <span className={cx('Font18', 'icon-chatnetwork-type' + type)}></span>
                        <span className="flex pLeft12 ellipsis">{item.companyName}</span>
                      </Fragment>
                    ) : (
                      <Fragment>
                        <span className="icon-task-select-other Font18 ThemeColor3"></span>
                        <span className="flex pLeft12 ellipsis">
                          {_l('个人好友')}
                          <span className="Font12">{_l('(非同事)')}</span>
                        </span>
                      </Fragment>
                    )}

                    <span className="icon-arrow-right-border"></span>
                  </li>
                </Fragment>
              );
            })}
          </ul>
        </div>
      </Dialog>
    );
  }
}

export default function (options) {
  if (options.selectProject && md.global.Account.projects.length) {
    FunctionWrap(SelectProject, Object.assign({ friendVisible: true }, options));
  } else {
    FunctionWrap(AddFriends, Object.assign({ projectId: '', fromType: 0 }, options));
  }
}
