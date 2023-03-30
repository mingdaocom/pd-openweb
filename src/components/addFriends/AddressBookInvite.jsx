import React, { Component } from 'react';
import { Icon, Button } from 'ming-ui';
import Result from 'src/components/dialogSelectUser/GeneralSelect/Result';
import InviteController from 'src/api/invitation';
import { existAccountHint } from 'src/components/common/function';
import dialogSelectUser from 'src/components/dialogSelectUser/dialogSelectUser';

export default class AddressBookInvite extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectUsers: [],
      loading: false,
    };
  }

  // 通讯录邀请（添加人员）
  handleInviteMember = () => {
    const { selectUsers } = this.state;
    const _this = this;
    const filterAccountIds = [md.global.Account.accountId].concat(selectUsers.map(i => i.accountId));
    dialogSelectUser({
      zIndex: 11,
      fromType: _this.props.fromType,
      SelectUserSettings: {
        filterAccountIds: filterAccountIds,
        callback: users => {
          _this.setState({ selectUsers: selectUsers.concat(users) });
        },
      },
    });
  };

  deleteFn = accountId => {
    this.setState({ selectUsers: this.state.selectUsers.filter(u => u.accountId !== accountId) });
  };

  submit = () => {
    const { projectId, onCancel, fromType } = this.props;
    const { selectUsers = [], loading } = this.state;

    if (loading) return;

    this.setState({ loading: true });
    InviteController.inviteUser({
      sourceId: projectId,
      accountIds: selectUsers.map(i => i.accountId),
      fromType,
    })
      .done(result => {
        existAccountHint(result);
        onCancel();
        this.setState({ loading: false });
      })
      .fail(() => {
        alert('邀请失败', 2);
        this.setState({ loading: false });
      });
  };

  render() {
    const { projectId } = this.props;
    const { selectUsers, loading } = this.state;
    return (
      <div className="addFriendsContent">
        <div className="Gray_75 mBottom12">{_l('从联系人中选择用户，邀请加入到当前组织')}</div>

        <div className="resultContent" style={{ maxHeight: 280 }}>
          {selectUsers.map(user => {
            const props = {
              avatar: <img src={user.avatar} alt="头像" className="GSelect-result-subItem__avatar" />,
              id: user.accountId,
              name: user.fullname,
              deleteFn: this.deleteFn,
            };
            return <Result {...props} key={user.accountId} />;
          })}
        </div>
        <div className="addBox ThemeColor3" onClick={this.handleInviteMember}>
          <span>
            <Icon icon="add1" />
            {_l('选择')}
          </span>
        </div>

        <div className="footContainer">
          <div className="addBox Gray_9e">
            <span onClick={() => window.open(`${location.origin}/admin/structure/${projectId}`)}>
              <Icon icon="settings1" />
              {_l('邀请设置')}
            </span>
          </div>
          <Button
            disabled={!selectUsers.length || loading}
            onClick={evt => {
              evt.nativeEvent.stopImmediatePropagation();
              this.submit();
            }}
          >
            {_l('发送邀请')}
          </Button>
        </div>
      </div>
    );
  }
}
