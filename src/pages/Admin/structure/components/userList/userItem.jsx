import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import Confirm from 'ming-ui/components/Dialog/Confirm';
import withClickAway from 'ming-ui/decorators/withClickAway';
import importUserController from 'src/api/importUser';
import userController from 'src/api/user';
import { loadUsers, loadInactiveUsers, loadApprovalUsers, loadAllUsers } from '../../actions/entities';
import { updateUserOpList, addUserToSet, removeUserFromSet, emptyUserSet, fetchApproval } from '../../actions/current';
import cx from 'classnames';
import TransferDialog from '../../modules/dialogHandover';
import Approval from '../../modules/dialogApproval';
import RefuseUserJoinDia from '../../modules/refuseUserJoinDia';
import EditInfo from '../../modules/dialogEditInfo/edit';
import departmentController from 'src/api/department';
import moment from 'moment';
import userBoard from '../../modules/dialogUserBoard';
import { Checkbox, Tooltip, Dialog, Input } from 'ming-ui';
import { Dropdown } from 'antd';
import './userItem.less';
import { encrypt } from 'src/util';
import RegExp from 'src/util/expression';

const refreshData = (departmentId, typeCursor, projectId, pageIndex, dispatch) => {
  if (departmentId) {
    dispatch(loadUsers(departmentId, pageIndex));
  } else {
    switch (typeCursor) {
      case 0:
        dispatch(loadAllUsers(projectId, pageIndex));
        break;
      case 1:
        dispatch(loadUsers(departmentId, pageIndex));
        break;
      case 2:
        dispatch(loadInactiveUsers(projectId, pageIndex));
        break;
      case 3:
        dispatch(loadApprovalUsers(projectId, pageIndex));
        break;
    }
  }
};
@withClickAway
class OpList extends Component {
  render() {
    const {
      isOpen,
      user,
      handleEditUserClick,
      handleResetPasswordClick,
      handleRemoveUserClick,
      handleApprovalClick,
      projectId,
      typeCursor,
      dispatch,
      setValue,
      accountId,
      departmentId,
      handleRefuseClick,
      isChargeUser,
    } = this.props;
    // if (typeCursor === 1) return null;
    if (isOpen) {
      return (
        <div className="opList">
          <ul className=" TxtLeft">
            {typeCursor === 2 && (
              <React.Fragment>
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
                        setValue();
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
                              dispatch(loadInactiveUsers(projectId, 1));
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
              </React.Fragment>
            )}
            {typeCursor === 3 && (user.status == 3 || user.status == 2) && (
              <React.Fragment>
                {user.status == 3 && (
                  <li className="opItem" onClick={handleRefuseClick}>
                    {_l('拒绝')}
                  </li>
                )}
                <li className="opItem" onClick={handleApprovalClick}>
                  {user.status == 2 ? _l('重新审批') : user.status == 3 ? _l('审批') : ''}
                </li>
              </React.Fragment>
            )}
            {(typeCursor === 0 || typeCursor === 1) && (
              <React.Fragment>
                <li
                  className="opItem"
                  onClick={() => {
                    this.props.handleEditUserClick();
                    $('.dropDownOptBox .opList').css({ display: 'none' });
                  }}
                >
                  {_l('编辑')}
                </li>
                {!md.global.Config.IsPlatformLocal && (
                  <li className="opItem" onClick={handleResetPasswordClick}>
                    {_l('重置密码')}
                  </li>
                )}
                {departmentId && !isChargeUser && (
                  <li
                    className="opItem"
                    onClick={() => {
                      this.props.setAndCancelCharge({
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
                      this.props.setAndCancelCharge({
                        projectId: projectId,
                        departmentId: departmentId,
                        chargeAccountId: user.accountId,
                      });
                    }}
                  >
                    {_l('取消部门负责人')}
                  </li>
                )}
                {/* <li className="opItem" onClick={() => {
                userBoard({
                  type: 'adjust',
                  projectId,
                  accountIds: [accountId],
                  noFn() { },
                  yesFn() {
                    refreshData(departmentId, typeCursor, projectId, 1, dispatch);
                  }
                });
              }}>{_l('调整部门')}</li> */}
                {user.accountId === md.global.Account.accountId ? null : (
                  <li className="opItem leaveText" onClick={handleRemoveUserClick}>
                    {_l('离职')}
                  </li>
                )}
              </React.Fragment>
            )}
          </ul>
        </div>
      );
    } else {
      return null;
    }
  }
}

const clearActiveDialog = props => {
  return function () {
    const { dispatch } = props;
    dispatch(updateUserOpList(null));
  };
};

class UserItem extends Component {
  constructor(props) {
    super(props);
    this.handleOpBtnClick = this.handleOpBtnClick.bind(this);
    this.handleRemoveUserClick = this.handleRemoveUserClick.bind(this);
    this.handleEditUserClick = this.handleEditUserClick.bind(this);
    this.handleResetPasswordClick = this.handleResetPasswordClick.bind(this);
    this.handleCheckbox = this.handleCheckbox.bind(this);
    this.handleApprovalClick = this.handleApprovalClick.bind(this);
    this.state = {
      showDialog: false,
      resetPasswordShowDialog: false,
      isMinSc: false, // document.body.clientWidth <= 1380
      showDialogApproval: false,
      showRefuseUserJoin: false,
      password: '',
    };
  }

  componentDidMount() {
    const { accountId } = this.props;
    require(['mdBusinessCard'], () => {
      $(this.avatar).one('mouseover', () => {
        $(this.avatar)
          .mdBusinessCard({
            accountId,
          })
          .trigger('mouseenter');
      });
    });
  }

  renderContact(user) {
    const { contactPhone, mobilePhone, isPrivateMobile, accountId } = user;
    let mobileTpl = null;
    if (mobilePhone) {
      mobileTpl = (
        <div className="ellipsis w100">
          <span className="w100 overflow_ellipsis WordBreak">{mobilePhone}</span>
        </div>
      );
    } else {
      if (isPrivateMobile) {
        mobileTpl = (
          <span title={_l('保密')} className="overLimi_130 overflow_ellipsis">
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
  }

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

  handleOpBtnClick() {
    const { accountId, dispatch } = this.props;
    dispatch(updateUserOpList(accountId));
  }

  renderEditInfo = () => {
    if (!this.state.showDialog) {
      return '';
    }
    const { accountId, projectId, departmentId, dispatch, pageIndex, typeCursor } = this.props;
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
                refreshData(departmentId, typeCursor, projectId, pageIndex, dispatch);
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

  handleApprovalClick() {
    this.setState({
      showDialogApproval: true,
    });
  }

  refuseUserJoin = () => {
    if (!this.state.showRefuseUserJoin) {
      return '';
    }
    const { accountId, projectId, dispatch } = this.props;
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
                dispatch(loadApprovalUsers(projectId, 1));
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
    const { accountId, projectId, departmentId, dispatch, pageIndex } = this.props;
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
                dispatch(loadApprovalUsers(projectId, 1));
                dispatch(fetchApproval(projectId));
              }
            },
          );
        }}
      />
    );
  };

  handleEditUserClick() {
    this.setState({
      showDialog: !this.state.showDialog,
    });
  }

  handleResetPasswordClick() {
    this.setState({
      resetPasswordShowDialog: !this.state.resetPasswordShowDialog,
    });
  }

  handleRemoveUserClick() {
    const { accountId, projectId, user, departmentId, dispatch, pageIndex, typeCursor } = this.props;
    TransferDialog({
      accountId,
      projectId,
      user: { ...user },
      success() {
        dispatch(emptyUserSet());
        refreshData(departmentId, typeCursor, projectId, 1, dispatch);
      },
    });
  }

  handleCheckbox = (isChecked, accountId) => {
    const { dispatch } = this.props;
    if (!isChecked) {
      dispatch(addUserToSet([accountId]));
    } else {
      dispatch(removeUserFromSet([accountId]));
    }
  };

  setAndCancelCharge = ({ projectId, departmentId, chargeAccountId }) => {
    let { typeCursor, dispatch } = this.props;
    departmentController
      .editDepartmentSingleChargeUser({
        projectId,
        departmentId,
        chargeAccountId,
      })
      .then(res => {
        if (res) {
          alert(_l('设置成功', 1));
          refreshData(departmentId, typeCursor, projectId, 1, dispatch);
        } else {
          alert(_l('设置失败', 2));
        }
      });
  };

  render() {
    const {
      user,
      isChargeUser,
      isChecked,
      isSearch,
      typeCursor,
      projectId,
      selectCount,
      isHideCurrentColumn,
      departmentId,
      columnsInfo = [],
    } = this.props;
    const { isMinSc } = this.state;
    let { jobs, departments, departmentInfos, jobInfos, department = '', job = '' } = user;
    let departmentData = departments || departmentInfos || [];
    if (typeCursor === 2) {
      departmentData = department;
    }
    let jobData = jobs || jobInfos;
    if (typeCursor === 2) {
      jobData = job;
    }
    let totalColWidth = 0;
    columnsInfo.forEach(item => {
      if (isHideCurrentColumn(item.value)) {
        totalColWidth += item.width;
      }
    });
    let setWidth = $('.listInfo') && totalColWidth > $('.listInfo').width();
    let departmentTitle = _.isArray(departmentData)
      ? departmentData
          .map((it, i) => {
            if (departmentData.length - 1 > i) {
              return `${it.name || it.departmentName} ; `;
            }
            return `${it.name || it.departmentName}`;
          })
          .join('')
      : departmentData;
    return (
      <tr key={user.accountId} className={classNames('userItem', { isChecked: isChecked })}>
        {typeCursor === 0 && (
          <td
            className={classNames('checkBox', {
              showCheckBox: isChecked,
              hasSelectCount: selectCount > 0,
              // opacity0: typeCursor === 2 || typeCursor === 3,
            })}
          >
            <Checkbox
              ref="example"
              key={`checkBox-${user.accountId}`}
              className="TxtMiddle InlineBlock"
              checked={isChecked}
              // id="1"
              onClick={(checked, id) => {
                this.handleCheckbox(isChecked, user.accountId);
              }}
            />
          </td>
        )}
        {isHideCurrentColumn('name') && (
          <td className={cx('nameTh', { left0: typeCursor !== 0 })} style={{ width: setWidth ? 200 : 'unset' }}>
            <div className="flexRow">
              <img src={user.avatar} alt="" className="avatar" ref={avatar => (this.avatar = avatar)} />
              <a
                href={'/user_' + user.accountId}
                className="overflow_ellipsis mLeft10 LineHeight32"
                title={user.fullname}
              >
                {user.fullname}
              </a>
              {isChargeUser ? (
                <Tooltip text={<span>{_l('部门负责人')}</span>} action={['hover']}>
                  <span className="icon-ic-head Font16 mLeft5 chargeIcon" title={_l('部门负责人')} />
                </Tooltip>
              ) : null}
            </div>
          </td>
        )}
        {typeCursor === 3 && isHideCurrentColumn('status') && (
          <td className="statusTh">
            <span className={cx({ ThemeColor3: user.status == 3, Red: user.status == 2 })}>
              {user.status == 3 && _l('待审核')}
              {user.status == 2 && _l('已拒绝')}
            </span>
          </td>
        )}
        {isHideCurrentColumn('position') && (
          <td className="jobTh">
            {
              <div
                className="job WordBreak overflow_ellipsis"
                title={
                  typeCursor === 2
                    ? jobData
                    : (jobData || []).map((it, i) => {
                        if (jobData.length - 1 > i) {
                          return `${it.name || it.jobName};`;
                        }
                        return `${it.name || it.jobName}`;
                      })
                }
              >
                {typeCursor === 2
                  ? jobData
                  : (jobData || []).map((it, i) => {
                      if (jobData.length - 1 > i) {
                        return `${it.name || it.jobName} ; `;
                      }
                      return `${it.name || it.jobName}`;
                    })}
              </div>
            }
          </td>
        )}
        {/* {isSearch ? <td title={user.department}>{user.department}</td> : null} */}
        {isHideCurrentColumn('department') && (
          <td className="departmentTh">
            {
              <div className="WordBreak overflow_ellipsis" title={departmentTitle}>
                {typeCursor === 2
                  ? departmentData
                  : (departmentData || []).map((it, i) => {
                      if (departmentData.length - 1 > i) {
                        return `${it.name || it.departmentName} ; `;
                      }
                      return `${it.name || it.departmentName}`;
                    })}
              </div>
            }
          </td>
        )}
        {isHideCurrentColumn('adress') && (
          <td className="workSiteTh overflow_ellipsis WordBreak">{user.workSiteName || user.workSite}</td>
        )}
        {isHideCurrentColumn('jobNum') && <td className="jobNumberTh overflow_ellipsis WordBreak">{user.jobNumber}</td>}
        {isHideCurrentColumn('phone') && (
          <td className="mobileTh overflow_ellipsis WordBreak"> {this.renderContact(user)}</td>
        )}
        {!isMinSc && isHideCurrentColumn('email') && (
          <td className="emailTh overflow_ellipsis WordBreak">{this.renderEmail(user)}</td>
        )}
        {!isMinSc && typeCursor === 3 ? (
          <React.Fragment>
            {isHideCurrentColumn('applyDate') && (
              <td className="dateTh overflow_ellipsis WordBreak">
                {/* {user.createTime ? _l('%0天', moment().endOf('day').diff(moment(user.createTime).startOf('day'), 'days') + 1) : null} */}
                {moment(user.updateTime).format('YYYY-MM-DD')}
              </td>
            )}
            {isHideCurrentColumn('operator') && (
              <td className="actMenTh overflow_ellipsis WordBreak">
                {!user.lastModifyUser || !user.lastModifyUser.fullname ? '' : user.lastModifyUser.fullname}
              </td>
            )}
          </React.Fragment>
        ) : (
          ''
        )}
        {isHideCurrentColumn('joinDate') && typeCursor === 0 && (
          <td className="joinDateTh">
            {user.addProjectTime
              ? moment(user.addProjectTime).format('YYYY-MM-DD')
              : moment(user.createTime).format('YYYY-MM-DD')}
          </td>
        )}
        <td className="actTh">
          <Dropdown
            overlayClassName="dropDownOptBox"
            trigger={['click']}
            placement="bottomLeft"
            overlay={
              <OpList
                {...this.props}
                onClickAway={clearActiveDialog(this.props)}
                handleRemoveUserClick={this.handleRemoveUserClick}
                handleEditUserClick={this.handleEditUserClick}
                handleResetPasswordClick={this.handleResetPasswordClick}
                handleApprovalClick={this.handleApprovalClick}
                handleRefuseClick={this.handleRefuseClick}
                setAndCancelCharge={this.setAndCancelCharge}
                setValue={() => {
                  this.setState({
                    showDialog: false,
                    showDialogApproval: false,
                  });
                }}
              />
            }
          >
            <span className="tip-top Hand" onClick={this.handleOpBtnClick}>
              <span className="icon-moreop TxtMiddle Font18 Gray_9e" />
            </span>
          </Dropdown>

          {this.renderEditInfo()}
          {this.renderResetPasswordInfo()}
          {this.renderApprovalInfo()}
          {this.refuseUserJoin()}
        </td>
      </tr>
    );
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

const connectedUserItem = connect(mapStateToProps)(UserItem);

export default connectedUserItem;
