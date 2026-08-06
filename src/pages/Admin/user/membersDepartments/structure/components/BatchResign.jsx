import React, { Component, Fragment } from 'react';
import { Dropdown, Menu } from 'antd';
import _ from 'lodash';
import styled, { createGlobalStyle } from 'styled-components';
import { antNotification, Checkbox, Dialog, Textarea, UserHead } from 'ming-ui';
import userAjax from 'src/api/user';

const BatchResignDialogStyle = createGlobalStyle`
  .batchResignByIdDialog {
    overflow: hidden;
    .mui-dialog-body {
      min-height: 0;
    }
  }
`;

const AccountIdsTextarea = styled(Textarea)`
  min-height: 350px !important;
  &:focus {
    border-color: var(--color-primary);
  }
`;

const UserList = styled.div`
  min-height: 350px;
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid var(--color-border-secondary);
  border-radius: 3px;
  padding: 8px 0;
  box-sizing: border-box;
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  height: 42px;
  padding: 0 18px;
  box-sizing: border-box;
`;

const FailedAccountIdItem = styled.div`
  line-height: 20px;
  word-break: break-all;
  color: var(--color-text-primary);
`;

const MenuWrap = styled(Menu)`
  padding: 6px 0;
  box-sizing: border-box;
  .ant-dropdown-menu-item {
    padding: 7px 12px !important;
  }
  .ant-dropdown-menu-item-disabled {
    color: var(--color-text-tertiary) !important;
  }
`;

export default class BatchResign extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      step: 'input',
      accountIdText: '',
      users: [],
      selectedAccountIds: [],
      loading: false,
      failedAccountIds: [], // 已离职 或 不存在
    };
  }

  handleRemoveUsersRes = (res, success = () => {}) => {
    if (res.result === 1) {
      success();
      alert(_l('操作成功'));
    } else if (res.result === 3) {
      let users = (res.failedNames || []).map(u => `"${u}"`).join('、');

      antNotification['error']({
        className: 'removeUserErr',
        key: 'removeUserErr',
        duration: 5,
        message: _l('批量离职失败'),
        description: (
          <div>
            <div>{_l('您操作的成员批量离职失败')}</div>
            <div>{_l('失败原因：用户%0是超级管理员，不可离职', users)}</div>
          </div>
        ),
      });
    } else if (res.result === 101) {
      alert(_l('请注意，您勾选了自己，无法进行离职操作。'), 2);
    }
  };

  batchResign = () => {
    const { selectedAccountIds = [], projectId, loadData = () => {}, updateSelectedAccountIds = () => {} } = this.props;

    if (selectedAccountIds.length > 50) {
      alert(_l('请注意，单次批量离职人数不得超过50人'), 2);
      return;
    }

    Dialog.confirm({
      title: _l('批量离职'),
      buttonType: 'danger',
      description: (
        <div className="textPrimary">
          {_l('您共勾选了')}
          <span className="colorPrimary"> {selectedAccountIds.length} </span>
          {_l('个成员，是否确认将勾选成员离职？')}
        </div>
      ),
      okText: _l('确认'),
      onOk: () => {
        userAjax
          .removeUsers({
            projectId,
            accountIds: selectedAccountIds,
          })
          .then(res => {
            this.handleRemoveUsersRes(res, () => {
              loadData();
              updateSelectedAccountIds([]);
            });
          });
      },
    });
  };

  parseAccountIds = () => {
    const { accountIdText } = this.state;

    return _.uniq((accountIdText || '').split(/[\s,，;；]+/).filter(_.identity));
  };

  openByIdDialog = () => {
    this.setState({
      visible: true,
      step: 'input',
      accountIdText: '',
      users: [],
      selectedAccountIds: [],
      loading: false,
      failedAccountIds: [],
    });
  };

  closeByIdDialog = () => {
    this.setState({ visible: false, loading: false });
  };

  getUsersByIds = () => {
    const { projectId } = this.props;
    const accountIds = this.parseAccountIds();

    if (_.isEmpty(accountIds)) {
      alert(_l('请输入需要办理离职的成员ID'), 2);
      return;
    }

    if (accountIds.length > 50) {
      alert(_l('请注意，单次批量离职人数不得超过 50 行ID'), 2);
      return;
    }

    this.setState({ loading: true });

    userAjax
      .getUserListByAccountId({
        projectId,
        accountIds,
        onlyProjectNormalUser: true,
      })
      .then(res => {
        const users = res.list || [];

        if (_.isEmpty(users)) {
          alert(_l('未查询到可离职成员'), 2);
          this.setState({ loading: false });
          return;
        }

        const selectedAccountIds = users.map(user => user.accountId);

        const failedAccountIds =
          res.failedIds || accountIds.filter(accountId => !_.includes(selectedAccountIds, accountId));

        this.setState({
          step: 'confirm',
          users,
          selectedAccountIds,
          loading: false,
          failedAccountIds: failedAccountIds.map(item => (_.isObject(item) ? item.accountId : item)).filter(_.identity),
        });
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  };

  removeUsersByIds = () => {
    const { projectId, loadData = () => {} } = this.props;
    const { selectedAccountIds } = this.state;

    if (_.isEmpty(selectedAccountIds)) {
      alert(_l('请选择需要离职的成员'), 2);
      return;
    }

    this.setState({ loading: true });
    userAjax
      .removeUsers({
        projectId,
        accountIds: selectedAccountIds,
      })
      .then(res => {
        this.handleRemoveUsersRes(res, () => {
          loadData();
          this.setState({
            visible: false,
            loading: false,
            step: 'input',
            accountIdText: '',
            users: [],
            selectedAccountIds: [],
            failedAccountIds: [],
          });
        });
        if (res.result !== 1) {
          this.setState({ loading: false });
        }
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  };

  viewFailedAccountIds = () => {
    const { failedAccountIds } = this.state;

    Dialog.confirm({
      title: _l('%0个ID解析失败', failedAccountIds.length),
      width: 520,
      noFooter: true,
      children: (
        <div>
          {failedAccountIds.map((accountId, index) => {
            return <FailedAccountIdItem key={`${accountId}-${index}`}>{accountId}</FailedAccountIdItem>;
          })}
        </div>
      ),
    });
  };

  renderMenu = () => {
    const { selectedAccountIds = [] } = this.props;

    return (
      <MenuWrap>
        <Menu.Item key="batchResign" disabled={_.isEmpty(selectedAccountIds)} onClick={this.batchResign}>
          {_l('批量离职')}
        </Menu.Item>
        <Menu.Item key="batchResignById" onClick={this.openByIdDialog}>
          {_l('按 ID 批量离职')}
        </Menu.Item>
      </MenuWrap>
    );
  };

  renderByIdDialog = () => {
    const { projectId } = this.props;
    const { visible, step, accountIdText, users, selectedAccountIds, loading, failedAccountIds } = this.state;
    const isInputStep = step === 'input';
    const inputAccountIds = this.parseAccountIds();
    const checkedAll = !_.isEmpty(users) && selectedAccountIds.length === users.length;

    return (
      <Dialog
        width={660}
        className="batchResignByIdDialog"
        visible={visible}
        title={_l('按 ID 批量离职')}
        okText={isInputStep ? _l('下一步') : _l('离职(%0)', selectedAccountIds.length)}
        cancelText={_l('取消')}
        buttonType={isInputStep ? 'primary' : 'danger'}
        okDisabled={loading || (isInputStep ? _.isEmpty(inputAccountIds) : _.isEmpty(selectedAccountIds))}
        onCancel={this.closeByIdDialog}
        onOk={isInputStep ? this.getUsersByIds : this.removeUsersByIds}
      >
        {isInputStep ? (
          <Fragment>
            <div className="textSecondary mBottom12">
              {_l('请输入需要办理离职的成员 ID，每行输入一个。最多批量离职50个成员')}
            </div>
            <AccountIdsTextarea isFocus value={accountIdText} onChange={val => this.setState({ accountIdText: val })} />
          </Fragment>
        ) : (
          <Fragment>
            <div className="textSecondary mBottom12">
              {_l('解析出 %0 个组织下成员，请确认', users.length)}

              {!_.isEmpty(failedAccountIds) ? (
                <span>
                  {_l('%0个ID解析失败', failedAccountIds.length)}
                  <span className="colorPrimary hoverColorPrimary mLeft6 Hand" onClick={this.viewFailedAccountIds}>
                    {_l('查看')}
                  </span>
                </span>
              ) : null}
            </div>
            <UserList>
              <UserItem>
                <Checkbox
                  checked={checkedAll}
                  onClick={checked => {
                    this.setState({
                      selectedAccountIds: checked ? [] : users.map(user => user.accountId),
                    });
                  }}
                />
                <span className="mLeft12">{_l('全选')}</span>
              </UserItem>
              {users.map(user => {
                const checked = _.includes(selectedAccountIds, user.accountId);

                return (
                  <UserItem key={user.accountId}>
                    <Checkbox
                      checked={checked}
                      onClick={() => {
                        this.setState({
                          selectedAccountIds: checked
                            ? selectedAccountIds.filter(accountId => accountId !== user.accountId)
                            : selectedAccountIds.concat(user.accountId),
                        });
                      }}
                    />
                    <UserHead
                      className="mLeft12"
                      user={{
                        userHead: user.avatar,
                        accountId: user.accountId,
                      }}
                      size={28}
                      projectId={projectId}
                    />
                    <span className="mLeft10 flex overflow_ellipsis" title={user.fullname}>
                      {user.fullname}
                    </span>
                  </UserItem>
                );
              })}
            </UserList>
          </Fragment>
        )}
      </Dialog>
    );
  };

  render() {
    return (
      <Fragment>
        <BatchResignDialogStyle />
        <Dropdown trigger={['click']} overlay={this.renderMenu()}>
          <div className="actBtn">
            {_l('离职')}
            <span className="icon-arrow-down-border Font12 mLeft6" />
          </div>
        </Dropdown>
        {this.state.visible && this.renderByIdDialog()}
      </Fragment>
    );
  }
}
