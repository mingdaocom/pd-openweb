import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Confirm from 'ming-ui/components/Dialog/Confirm';
import withClickAway from 'ming-ui/decorators/withClickAway';
import userController from 'src/api/user';
import importUserController from 'src/api/importUser';
import { loadUsers, loadInactiveUsers, loadApprovalUsers, loadAllUsers } from '../../actions/entities';
import { updateUserOpList, addUserToSet, removeUserFromSet, emptyUserSet, fetchApproval } from '../../actions/current';
import TransferDialog from '../../modules/dialogHandover';
import Approval from '../../modules/dialogApproval';
import RefuseUserJoinDia from '../../modules/refuseUserJoinDia';
import EditInfo from '../../modules/dialogEditInfo/edit';
import departmentController from 'src/api/department';
import { Dialog, Input } from 'ming-ui';
import { encrypt } from 'src/util';
import './userItem.less';

class UserItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showDialog: false,
      isMinSc: false, // document.body.clientWidth <= 1380
      showDialogApproval: false,
      showRefuseUserJoin: false,
      resetPasswordShowDialog: false,
    };
  }

  componentDidMount() {}

  refreshData = (departmentId, typeCursor, projectId, pageIndex) => {
    const { loadUsers, loadAllUsers, loadInactiveUsers, loadApprovalUsers } = this.props;
    if (departmentId) {
      loadUsers(departmentId, pageIndex);
    } else {
      switch (typeCursor) {
        case 0:
          loadAllUsers(projectId, pageIndex);
          break;
        case 1:
          loadUsers(departmentId, pageIndex);
          break;
        case 2:
          loadInactiveUsers(projectId, pageIndex);
          break;
        case 3:
          loadApprovalUsers(projectId, pageIndex);
          break;
      }
    }
  };

  renderContact = user => {
    const { contactPhone, mobilePhone, isPrivateMobile, accountId } = user;
    let mobileTpl = null;
    if (mobilePhone) {
      mobileTpl = (
        <div className="ellipsis w100">
          <span className="Remind w100 overflow_ellipsis WordBreak">{mobilePhone}</span>
        </div>
      );
    } else {
      if (isPrivateMobile) {
        mobileTpl = (
          <span title={_l('保密')} className="overLimi_130 overflow_ellipsis Remind">
            *********
          </span>
        );
      } else {
        mobileTpl = (
          <div className="Gray_9e ellipsis forRemind w100 overflow_ellipsis WordBreak">
            <span onClick={this.sendNotice(1)} className="Remind w100 overflow_ellipsis WordBreak">
              {_l('提醒填写')}
            </span>
          </div>
        );
      }
    }

    return mobileTpl;
  };

  renderEmail(user) {
    let emailTpl = null;
    const { email, isPrivateEmail } = user;
    if (email) {
      emailTpl = <span title={email}>{email}</span>;
    } else if (isPrivateEmail) {
      emailTpl = (
        <span title={_l('保密')} className="overLimi_130 overflow_ellipsis">
          *********
        </span>
      );
    }
    return emailTpl;
  }

  sendNotice(type) {
    const { projectId, accountId } = this.props;
    return event => {
      event.stopPropagation();
      require(['mdFunction'], MDFunction => {
        MDFunction.sendNoticeInvite([accountId], '', projectId, type);
      });
    };
  }

  handleOpBtnClick = () => {
    const { accountId, updateUserOpList } = this.props;
    updateUserOpList(accountId);
  };

  renderEditInfo = () => {
    if (!this.state.showDialog) {
      return '';
    }
    const { accountId, projectId, departmentId, pageIndex, typeCursor } = this.props;
    return (
      <EditInfo
        key={`editUserInfo_${accountId}`}
        showDialog={this.state.showDialog}
        accountId={accountId}
        projectId={projectId}
        setValue={({ isOk = false }) => {
          this.setState(
            {
              showDialog: false,
            },
            () => {
              if (isOk) {
                this.refreshData(departmentId, typeCursor, projectId, pageIndex);
              }
            },
          );
        }}
      />
    );
  };

  renderResetPasswordInfo = () => {
    const { md = {} } = window;
    const { global = {} } = md;
    const { SysSettings = {} } = global;
    const { passwordRegexTip, passwordRegex } = SysSettings;
    if (!this.state.resetPasswordShowDialog) {
      return '';
    }
    return (
      <Dialog
        title={_l('重置密码')}
        okText={_l('保存')}
        cancelText={_l('取消')}
        onCancel={() => {
          this.setState({ resetPasswordShowDialog: false });
        }}
        onOk={this.handleSavePassWord}
        visible={this.state.resetPasswordShowDialog}
      >
        <div className="Font15 Gray mTop20 mBottom10">{_l('请输入新密码')}</div>
        <Input
          className="w100"
          type="password"
          value={this.state.password}
          placeholder={passwordRegexTip || _l('密码，8-20位，必须含字母+数字')}
          onChange={value => {
            this.setState({ password: value });
          }}
        />
      </Dialog>
    );
  };

  handleSavePassWord = () => {
    const { accountId, projectId } = this.props;
    const { password } = this.state;
    const { md = {} } = window;
    const { global = {} } = md;
    const { SysSettings = {} } = global;
    const { passwordRegexTip, passwordRegex } = SysSettings;
    if (_.isEmpty(password)) {
      alert(_l('请输入新密码'), 3);
      return;
    } else if (!RegExp.isPasswordRule(password, passwordRegex)) {
      alert(passwordRegexTip || _l('密码过于简单，至少8~20位且含字母+数字'), 3);
      return;
    }
    userController
      .resetPassword({
        projectId,
        accountId,
        password: encrypt(password),
      })
      .then(result => {
        if (result) {
          alert(_l('修改成功'), 1);
          this.setState({ resetPasswordShowDialog: false, password: '' });
        } else {
          alert(_l('修改失败'), 2);
        }
      });
  };

  handleRefuseClick = () => {
    this.setState({
      showRefuseUserJoin: true,
    });
  };

  handleApprovalClick = () => {
    this.setState({
      showDialogApproval: true,
    });
  };

  refuseUserJoin = () => {
    if (!this.state.showRefuseUserJoin) {
      return '';
    }
    const { accountId, projectId, loadApprovalUsers } = this.props;
    return (
      <RefuseUserJoinDia
        key={`RefuseUserJoinDia_${accountId}`}
        showDialog={this.state.showRefuseUserJoin}
        accountId={accountId}
        projectId={projectId}
        setValue={({ isOk = false }) => {
          this.setState(
            {
              showRefuseUserJoin: false,
            },
            () => {
              if (isOk) {
                loadApprovalUsers(projectId, 1);
              }
            },
          );
        }}
      />
    );
  };

  renderApprovalInfo = () => {
    if (!this.state.showDialogApproval) {
      return '';
    }
    const { accountId, projectId, loadApprovalUsers, fetchApproval } = this.props;
    return (
      <Approval
        key={`Approval_${accountId}`}
        showDialog={this.state.showDialogApproval}
        accountId={accountId}
        projectId={projectId}
        setValue={({ isOk = false }) => {
          this.setState(
            {
              showDialogApproval: false,
            },
            () => {
              if (isOk) {
                loadApprovalUsers(projectId, 1);
                fetchApproval(projectId);
              }
            },
          );
        }}
      />
    );
  };

  handleEditUserClick = () => {
    this.setState({
      showDialog: !this.state.showDialog,
    });
  };

  handleRemoveUserClick = () => {
    const { accountId, projectId, user, departmentId, typeCursor, emptyUserSet } = this.props;
    TransferDialog({
      accountId,
      projectId,
      user: { ...user },
      success() {
        emptyUserSet();
        this.refreshData(departmentId, typeCursor, projectId, 1);
      },
    });
  };

  handleCheckbox = (isChecked, accountId) => {
    const { addUserToSet, removeUserFromSet } = this.props;
    if (!isChecked) {
      addUserToSet([accountId]);
    } else {
      removeUserFromSet([accountId]);
    }
  };

  setAndCancelCharge = ({ projectId, departmentId, chargeAccountId }) => {
    let { typeCursor } = this.props;
    departmentController
      .editDepartmentSingleChargeUser({
        projectId,
        departmentId,
        chargeAccountId,
      })
      .then(res => {
        if (res) {
          alert(_l('设置成功', 1));
          this.refreshData(departmentId, typeCursor, projectId, 1);
        } else {
          alert(_l('设置失败', 2));
        }
      });
  };

  handleResetPasswordClick = () => {
    this.setState({
      resetPasswordShowDialog: !this.state.resetPasswordShowDialog,
    });
  };

  render() {
    const {
      isOpen,
      user,
      projectId,
      typeCursor,
      setValue = () => {},
      departmentId,
      isChargeUser,
      loadInactiveUsers,
    } = this.props;
    let _this = this;
    if (isOpen) {
      return (
        <Fragment>
          <div className="opList">
            <ul className=" TxtLeft">
              {typeCursor === 2 && (
                <Fragment>
                  <li
                    className="opItem"
                    onClick={() => {
                      // if (!user.accountId) return;
                      importUserController
                        .reInviteImportUser({
                          accounts: [user.accountId],
                          projectId: projectId,
                        })
                        .done(function (result) {
                          _this.setState({
                            showDialog: false,
                            showDialogApproval: false,
                          });
                          if (result) {
                            alert(_l('重新邀请成功'), 1);
                          } else {
                            alert(_l('重新邀请失败'), 2);
                          }
                        });
                    }}
                  >
                    {_l('重新邀请')}
                  </li>
                  <li
                    className="opItem"
                    onClick={() => {
                      Confirm({
                        className: 'deleteNodeConfirm',
                        title: _l('确认取消邀请该用户吗'),
                        description: '',
                        okText: _l('确定'),
                        onOk: () => {
                          importUserController
                            .cancelImportUser({
                              accounts: [user.accountId],
                              projectId: projectId,
                            })
                            .done(function (result) {
                              setValue();
                              if (result) {
                                loadInactiveUsers(projectId, 1);
                              } else {
                                alert(_l('取消失败'), 2);
                              }
                            });
                        },
                      });
                    }}
                  >
                    {_l('取消邀请并移除')}
                  </li>
                </Fragment>
              )}
              {typeCursor === 3 && (user.status == 3 || user.status == 2) && (
                <Fragment>
                  {user.status == 3 && (
                    <li className="opItem" onClick={this.handleRefuseClick}>
                      {_l('拒绝')}
                    </li>
                  )}
                  <li className="opItem" onClick={this.handleApprovalClick}>
                    {user.status == 2 ? _l('重新审批') : user.status == 3 ? _l('审批') : ''}
                  </li>
                </Fragment>
              )}
              {(typeCursor === 0 || typeCursor === 1) && (
                <Fragment>
                  <li className="opItem" onClick={this.handleEditUserClick}>
                    {_l('编辑')}
                  </li>
                  {md.global.Config.IsLocal && (
                    <li className="opItem" onClick={this.handleResetPasswordClick}>
                      {_l('重置密码')}
                    </li>
                  )}
                  {departmentId && !isChargeUser && (
                    <li
                      className="opItem"
                      onClick={() => {
                        this.setAndCancelCharge({
                          projectId: projectId,
                          departmentId: departmentId,
                          chargeAccountId: user.accountId,
                        });
                      }}
                    >
                      {_l('设为部门负责人')}
                    </li>
                  )}
                  {departmentId && isChargeUser && (
                    <li
                      className="opItem"
                      onClick={() => {
                        this.setAndCancelCharge({
                          projectId: projectId,
                          departmentId: departmentId,
                          chargeAccountId: user.accountId,
                        });
                      }}
                    >
                      {_l('取消部门负责人')}
                    </li>
                  )}
                  {user.accountId === md.global.Account.accountId ? null : (
                    <li className="opItem leaveText" onClick={this.handleRemoveUserClick}>
                      {_l('离职')}
                    </li>
                  )}
                </Fragment>
              )}
            </ul>
          </div>
          {this.renderEditInfo()}
          {this.renderResetPasswordInfo()}
          {this.renderApprovalInfo()}
          {this.refuseUserJoin()}
        </Fragment>
      );
    } else {
      return null;
    }
  }
}

const mapStateToProps = (state, ownProps) => {
  const {
    current: { projectId, departmentId, activeAccountId, selectedAccountIds, typeCursor, isSelectAll },
    pagination: {
      userList: { pageIndex },
    },
  } = state;
  const { accountId } = ownProps.user;
  const isChecked = _.some(selectedAccountIds, id => id === accountId) || isSelectAll;
  return {
    isOpen: activeAccountId === accountId,
    accountId,
    isChecked,
    projectId,
    departmentId,
    pageIndex,
    typeCursor,
    selectCount: selectedAccountIds.length,
  };
};

const connectedUserItem = connect(mapStateToProps, dispatch =>
  bindActionCreators(
    {
      loadUsers,
      loadAllUsers,
      loadInactiveUsers,
      loadApprovalUsers,
      updateUserOpList,
      fetchApproval,
      emptyUserSet,
      addUserToSet,
      removeUserFromSet,
    },
    dispatch,
  ),
)(UserItem);

export default connectedUserItem;
