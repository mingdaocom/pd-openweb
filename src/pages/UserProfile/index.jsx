import React from 'react';
import { ScrollView } from 'ming-ui';
import { addFriendConfirm } from 'ming-ui/functions';
import user from 'src/api/user';
import { getAppFeaturesVisible } from 'src/utils/app';
import UserProfile from './components/Profile';

export default class UserEntryPoint extends React.PureComponent {
  state = {
    accountId: '',
    isMe: false,
    isLoading: true,
    userInfo: {}, // 用户详细信息
    rUserList: [],
    isFriend: false,
    isTask: false,
  };

  componentDidMount() {
    $('html').addClass('AppUser');
    this.getAccountId();
  }

  componentWillUnmount() {
    $('html').removeClass('AppUser');
    if (this.request && this.request.abort) {
      this.request.abort();
    }
  }

  getAccountId = () => {
    // 获取accountId/判断是否是自己
    var accountId = (location.pathname.match(/.*\/user_(.{36})/) || '')[1] || md.global.Account.accountId;
    var isMe = accountId === md.global.Account.accountId;
    this.setState({
      isLoading: true,
    });
    this.request = user.getAccountDetail({
      accountId: accountId,
    });

    this.request
      .then(userInfo => {
        if (!userInfo) {
          const { rp } = getAppFeaturesVisible();
          this.setState({
            userInfo,
            isFriend: true,
          });
          if (rp) {
            addFriendConfirm({
              accountId: accountId,
            });
          }
          return;
        }
        var rUserList = [];
        if (!isMe) {
          rUserList = [
            {
              accountId: userInfo.accountId,
              fullname: userInfo.userName,
              avatar: userInfo.avatar,
            },
            {
              accountId: md.global.Account.accountId,
              fullname: md.global.Account.fullname,
              avatar: md.global.Account.avatar,
            },
          ];
        }

        this.setState({
          userInfo,
          isLoading: false,
          isMe,
          accountId,
          rUserList,
          isTask: true,
        });
      })
      .catch();
  };

  render() {
    const { isFriend, userInfo } = this.state;
    return (
      <ScrollView>
        <div className="mainUserProfile relative mTop18">
          {userInfo && <UserProfile {...this.state} getAccountId={() => this.getAccountId()} />}
          {isFriend && (
            <div className="card noticeContainer">
              <div>
                <i className="icon-error1 Font56" />
              </div>
              <div className="Font18 mTop10">{_l('对方不是您的联系人，无法查看')}</div>
            </div>
          )}
        </div>
      </ScrollView>
    );
  }
}
