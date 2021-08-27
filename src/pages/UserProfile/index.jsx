import React from 'react';
import user from 'src/api/user';
import ScrollView from 'ming-ui/components/ScrollView';
import UserProfile from './components/Profile';

export default class UserEntryPoint extends React.PureComponent {
  state = {
    accountId: '',
    isMe: false,
    isLoading: false,
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
    if (this.request && this.request.state() === 'pending' && this.request.abort) {
      this.request.abort();
    }
  }

  getAccountId = () => {
    // 获取accountId/判断是否是自己
    var url = window.location.href;
    var accountId = url.split('_')[1] || md.global.Account.accountId;
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
          this.setState({
            userInfo,
            isFriend: true,
          });
          require(['addFriendConfirm'], function (addFriendConfirm) {
            addFriendConfirm({
              accountId: accountId,
            });
          });
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
      .fail();
  };

  render() {
    const { isFriend, userInfo } = this.state;
    return (
      <ScrollView>
        <div className="mainUserProfile relativeContainer mTop18">
          {userInfo && <UserProfile {...this.state} getAccountId={() => this.getAccountId()}/>}
          {isFriend && (
            <div className="card noticeContainer">
              <div>
                <i className="icon-task-folder-message Font56" />
              </div>
              <div className="Font18 mTop10">{_l('对方不是您的联系人，无法查看')}</div>
            </div>
          )}
        </div>
      </ScrollView>
    );
  }
}
