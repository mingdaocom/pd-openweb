import React, { Component, Fragment } from 'react';
import { Button, Modal } from 'ming-ui/antd-components';
import { dialogSelectUser } from 'ming-ui/functions';
import account from 'src/api/account';
import { navigateTo } from 'src/router/navigation/navigateTo';
import { htmlEncodeReg } from 'src/utils/core/string';
import './index.less';

export default class ExitDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: {},
      exitLoading: false,
    };
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  handleSelct() {
    dialogSelectUser({
      title: _l('指定管理员'),
      zIndex: 100,
      showMoreInvite: false,
      SelectUserSettings: {
        projectId: this.props.projectId,
        filterAll: true,
        filterFriend: true,
        filterOtherProject: true,
        filterAccountIds: [md.global.Account.accountId],
        unique: true,
        callback: userInfo => {
          this.setState({
            userInfo: userInfo[0],
          });
        },
      },
    });
  }
  toLogout = () => {
    const { projectId, companyName } = this.props;
    Modal.confirm({
      centered: true,
      title: <span className="Font15">{_l('您是组织【%0】超级管理员', companyName)}</span>,
      content: <span className="Font13 textPrimary">{_l('请先注销组织或交接后方可注销。')}</span>,
      okText: _l('前往注销'),
      cancelButtonProps: { style: { display: 'none' } },
      onOk: () => {
        navigateTo('/admin/sysinfo/' + projectId);
      },
    });
  };
  handleExit() {
    const accountId = this.state.userInfo.accountId;

    if (this.props.needTransfer && !accountId) {
      alert(_l('请指定成员'));
      return;
    }

    if (this.exitPending) return;

    this.exitPending = true;
    this.setState({ exitLoading: true });

    return account
      .exitProject({
        projectId: this.props.projectId,
        newAdminAccountId: accountId,
      })
      .then(result => {
        switch (result) {
          case 1:
            alert(_l('退出成功'));
            this.props.closeDialog();
            this.props.getData();
            break;
          case 3:
            this.props.transferAdminProject(this.props.projectId, this.props.companyName, this.props.password, result);
            break;
          case 4:
            this.toLogout();
            break;
          case 2:
          default:
            alert(_l('操作失败'), 3);
            break;
        }
      })
      .catch(error => console.error(error))
      .finally(() => {
        this.exitPending = false;
        if (!this.unmounted) {
          this.setState({ exitLoading: false });
        }
      });
  }

  render() {
    const { needTransfer } = this.props;
    const { userInfo, exitLoading } = this.state;
    return (
      <Fragment>
        {needTransfer ? (
          <div className="borderBox">
            <p>{_l('需要先移交管理身份再退出，退出后，管理员可以在后台交接或分配您负责的剩余工作')}</p>
            <div>
              <span
                className="icon-add_circle Font32 colorPrimary hoverColorPrimaryDark TxtMiddle Hand"
                onClick={() => this.handleSelct()}
              ></span>
              {userInfo.accountId ? (
                <span className="userTag TxtMiddle">
                  <span className="user" data-accountid={userInfo.accountId}>
                    <img src={userInfo.avatar} />
                    <span className="userfullname">{htmlEncodeReg(userInfo.fullname)}</span>
                  </span>
                </span>
              ) : (
                <span className="userTag TxtMiddle">{_l('未指定')}</span>
              )}
            </div>
            <Button type="primary" loading={exitLoading} className="exitProject" onClick={() => this.handleExit()}>
              {_l('确定')}
            </Button>
          </div>
        ) : (
          <div className="borderBox">
            <p className="mBottom0">{_l('退出后，管理员可以在后台交接或分配您负责的剩余工作')}</p>
            <Button type="primary" loading={exitLoading} className="exitProject" onClick={() => this.handleExit()}>
              {_l('确定')}
            </Button>
          </div>
        )}
      </Fragment>
    );
  }
}
