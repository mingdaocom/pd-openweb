import React, { Component } from 'react';
import { Icon } from 'ming-ui';
import { Button } from 'ming-ui/antd-components';
import { dialogSelectUser } from 'ming-ui/functions';
import Result from 'ming-ui/functions/dialogSelectUser/GeneralSelect/Result';
import { withOpeners } from 'ming-ui/hooks/useFunctionWrapComponent';
import InviteController from 'src/api/invitation';
import DialogSettingInviteRules from 'src/pages/Admin/user/membersDepartments/structure/components/dialogSettingInviteRules';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import { useInviteFailedDialog } from './InviteFailedDialog';

class AddressBookInvite extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectUsers: [],
      loading: false,
      showDialogSettingInviteRules: false,
    };
  }

  // 通讯录邀请（添加人员）
  handleInviteMember = () => {
    const { selectUsers } = this.state;
    const _this = this;
    const selectedAccountIds = selectUsers.map(i => i.accountId);

    dialogSelectUser({
      fromType: _this.props.fromType,
      SelectUserSettings: {
        filterAccountIds: [md.global.Account.accountId],
        selectedAccountIds: selectedAccountIds,
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
      .then(result => {
        this.props.openInviteFailedDialog({ inviteTotal: selectUsers.length, projectId, result });
        onCancel();
        this.setState({ loading: false });
      })
      .catch(_requestError => {
        alertIfNotUnauthorized(_requestError, _l('邀请失败'), 2);
        this.setState({ loading: false });
      });
  };

  render() {
    const { projectId, showInviteRules } = this.props;
    const { selectUsers, loading, showDialogSettingInviteRules } = this.state;
    return (
      <div className="addFriendsContent">
        <div className="textSecondary mBottom12">{_l('从联系人中选择用户，邀请加入到当前组织')}</div>

        <div className="resultContent" style={{ minHeight: 280 }}>
          {selectUsers.map(user => {
            const props = {
              avatar: <img src={user.avatar} alt={_l('头像')} className="GSelect-result-subItem__avatar" />,
              id: user.accountId,
              name: user.fullname,
              deleteFn: this.deleteFn,
            };
            return <Result {...props} key={user.accountId} />;
          })}
          <div className="addBox colorPrimary" onClick={this.handleInviteMember}>
            <span>
              <Icon icon="add1" />
              {_l('选择')}
            </span>
          </div>
        </div>

        <div className="footContainer">
          <div className="addBox textTertiary">
            {showInviteRules && (
              <span onClick={() => this.setState({ showDialogSettingInviteRules: true })}>
                <Icon icon="settings" />
                {_l('邀请设置')}
              </span>
            )}
          </div>

          <Button
            type="primary"
            loading={loading}
            disabled={!selectUsers.length}
            onClick={evt => {
              evt.nativeEvent.stopImmediatePropagation();
              this.submit();
            }}
          >
            {_l('发送邀请')}
          </Button>
        </div>

        {showDialogSettingInviteRules && (
          <DialogSettingInviteRules
            showDialogSettingInviteRules={showDialogSettingInviteRules}
            setValue={({ showDialogSettingInviteRules }) => this.setState({ showDialogSettingInviteRules })}
            projectId={projectId}
          />
        )}
      </div>
    );
  }
}

export default withOpeners(AddressBookInvite, {
  openInviteFailedDialog: useInviteFailedDialog,
});
