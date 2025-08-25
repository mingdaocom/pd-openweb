import React from 'react';
import copy from 'copy-to-clipboard';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import { Dialog, Icon, LoadDiv, ScrollView } from 'ming-ui';
import Menu from 'ming-ui/components/Menu';
import MenuItem from 'ming-ui/components/MenuItem';
import { addFriendConfirm as addFriendConfirmFun } from 'ming-ui/functions';
import { checkCertification } from 'src/components/checkCertification';
import UserBaseProfile from 'src/components/UserInfoComponents/UserBaseProfile.jsx';
import UserMoreProfile from 'src/components/UserInfoComponents/UserMoreProfile.jsx';
import API, { removeFriend } from '../api';
import { config } from '../config';
import AddFriend from './AddFriend';

const defaultState = {
  data: null,
  isLoading: false,
};

export default class UserDetail extends React.Component {
  constructor(props) {
    super(props);

    this.state = defaultState;

    this.addFriendConfirm = this.addFriendConfirm.bind(this);
    this.deleteFriendConfirm = this.deleteFriendConfirm.bind(this);
  }

  componentDidMount() {
    const { accountId } = this.props;
    if (accountId) {
      this.fetchUserDetail(accountId);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.accountId && nextProps.accountId !== this.props.accountId) {
      this.fetchUserDetail(nextProps.accountId);
    } else if (nextProps.accountId === null) {
      this.setState(defaultState);
    }
  }

  fetchUserDetail(accountId) {
    this.setState({
      isLoading: true,
    });
    API.fetchUserDetail(accountId)
      .then(data => {
        if (data) {
          data.userCards = (_.get(data, 'userCards') || []).filter(item => item.companyName);

          this.setState({
            ...defaultState,
            // assign default state
            data,
          });
        } else {
          this.setState({
            ...defaultState,
            // assign default state
            data,
          });
        }
      })
      .catch(() => {
        this.setState({
          ...defaultState,
          // assign default state
          data: undefined,
        });
      });
  }

  addFriendConfirm() {
    const { accountId } = this.props;
    addFriendConfirmFun({
      accountId,
    });
  }

  deleteFriendConfirm() {
    const { accountId } = this.props;
    Dialog.confirm({
      title: _l('确认删除当前好友？'),
      description: _l('删除后您将不显示在对方的好友列表里'),
      onOk: () => {
        removeFriend(accountId).then(() => {
          alert(_l('删除成功'), 1);
          this.setState({
            data: {
              ...this.state.data,
              isFriend: false,
            },
          });
        });
      },
    });
  }

  renderFriendTag() {
    const { isFriend, accountId } = this.state.data;
    if (accountId === md.global.Account.accountId) return null;
    if (!isFriend) {
      return (
        <span
          className="Right Gray_75 Hand ThemeHoverColor3"
          onClick={() => checkCertification({ isPersonal: true, checkSuccess: this.addFriendConfirm })}
        >
          <i className="Font14 icon-custom_add_circle TxtMiddle" />
          <span className="mLeft5 TxtMiddle Font12">{_l('添加好友')}</span>
        </span>
      );
    } else {
      return (
        <div className="Right Relative pTop8">
          <Trigger
            action={['click']}
            popupAlign={{
              points: ['tr', 'br'],
              offset: [-180, 4],
              overflow: { adjustX: true, adjustY: true },
            }}
            popup={
              <Menu con={'.contacts-detail-wrapper'}>
                <MenuItem icon={<Icon icon="hr_delete" className="TxtMiddle" />} onClick={this.deleteFriendConfirm}>
                  <span className="TxtMiddle">{_l('删除好友')}</span>
                </MenuItem>
              </Menu>
            }
          >
            <span className="Gray_75 Hand ThemeHoverColor3">
              <i className="Font14 icon-check_circle TxtMiddle" />
              <span className="mLeft5 TxtMiddle Font12">{_l('我的好友')}</span>
              <i className="Font14 mLeft5 icon-moreop TxtMiddle" />
            </span>
          </Trigger>
        </div>
      );
    }
  }

  renderHeader() {
    const {
      data: { avatar, fullname, userCards = [], accountId, isContact },
    } = this.state;
    const companyName = _.get(userCards, '[0].companyName');

    return (
      <React.Fragment>
        <div className="detail-header">
          <img src={avatar} className="detail-header-avatar" />
          <div className="detail-header-info flexRow">
            <div className="flex ellipsis pRight10">
              <div className="ellipsis bold">{fullname}</div>
              {userCards.length > 1 ? (
                <div className="ThemeColor">{_l('%0个共同组织', userCards.length)}</div>
              ) : companyName ? (
                <div className="Gray_75 ellipsis Font14">{companyName}</div>
              ) : (
                ''
              )}
            </div>
            {this.renderFriendTag()}
          </div>
        </div>
        <div className="detail-btns mTop24 mBottom24 flexRow alignItemsCenter bold">
          <a
            href="javascript:void 0;"
            className="detail-btn ThemeBGColor3 ThemeHoverBGColor2 NoUnderline"
            onClick={() => {
              if (isContact) {
                config.callback({ accountId });
              } else {
                this.addFriendConfirm();
              }
            }}
          >
            <Icon icon="chat" className="mRight5 Font18 TxtMiddle" />
            {_l('发消息')}
          </a>
          <a href={'/user_' + accountId} className="detail-btn Gray_75 mLeft10 NoUnderline" target="_blank">
            <Icon icon="dynamic-empty" className="mRight10 Font17 TxtMiddle" />
            {_l('TA的动态')}
          </a>
          <div className="flex"></div>
          {this.renderDetail()}
        </div>
      </React.Fragment>
    );
  }

  onCopyID = () => {
    copy(_.get(this.state.data, 'accountId'));
    alert(_l('复制成功'));
  };

  renderDetail() {
    return (
      <React.Fragment>
        <span className="Gray_9e Hover_21 Hand" onClick={this.onCopyID}>
          {_l('用户ID')}
          <Icon icon="copy" className="mLeft5" />
        </span>
      </React.Fragment>
    );
  }

  render() {
    const { isLoading, data } = this.state;
    const { userCards = [] } = data || {};
    const { accountId, projectId, hideBackBtn } = this.props;
    if (isLoading) {
      return (
        <div className="pTop20">
          <LoadDiv />
        </div>
      );
    }
    if (data === null) return null;
    if (!isLoading && data === undefined) {
      return <AddFriend accountId={accountId} />;
    }
    return (
      <ScrollView className="h100">
        <div className="contacts-detail-wrapper">
          {projectId && !hideBackBtn && (
            <div className="back Hand mBottom24" onClick={this.props.back}>
              <Icon icon="arrow-left-border" /> {_l('返回')}
            </div>
          )}
          {this.renderHeader()}
          <UserBaseProfile
            className="userProjectInfoWrap"
            infoWrapClassName="flexColumn"
            projects={userCards}
            isAddressBook={true}
            currentUserProject={
              _.find(userCards, v => v.projectId === projectId) || (!_.isEmpty(userCards) && userCards[0]) || {}
            }
            userInfo={data}
          />
          <UserMoreProfile className="mTop10" userInfo={data} rowNum={2} />
        </div>
      </ScrollView>
    );
  }
}
