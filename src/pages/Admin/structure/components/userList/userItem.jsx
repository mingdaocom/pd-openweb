import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import Confirm from 'ming-ui/components/Dialog/Confirm';
import withClickAway from 'ming-ui/decorators/withClickAway';
import importUserController from 'src/api/importUser';
import userController from 'src/api/user.js';
import {
  loadUsers,
  loadInactiveUsers,
  loadApprovalUsers,
  loadAllUsers,
  updateFullDepartmentInfo,
} from '../../actions/entities';
import { updateUserOpList, addUserToSet, removeUserFromSet, emptyUserSet } from '../../actions/current';
import cx from 'classnames';
import TransferDialog from '../../modules/dialogHandover';
import RefuseUserJoinDia from '../../modules/refuseUserJoinDia';
import departmentController from 'src/api/department';
import moment from 'moment';
import { Checkbox, Tooltip, Dialog, Input } from 'ming-ui';
import './userItem.less';
import { sendNoticeInvite } from 'src/components/common/function';
import 'src/components/mdBusinessCard/mdBusinessCard';
import { encrypt } from 'src/util';
import RegExp from 'src/util/expression';
import Trigger from 'rc-trigger';

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
      user,
      handleEditUserClick,
      handleResetPasswordClick,
      handleRemoveUserClick,
      handleApprovalClick,
      projectId,
      typeCursor,
      dispatch,
      setValue,
      departmentId,
      handleRefuseClick,
      isChargeUser,
    } = this.props;

    return (
      <div className="userOptlist">
        <ul className=" TxtLeft">
          {typeCursor === 2 && (
            <React.Fragment>
              <li
                className="opItem"
                onClick={e => {
                  e.stopPropagation();
                  this.props.changeOptListVisible();
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
                onClick={e => {
                  e.stopPropagation();
                  this.props.changeOptListVisible();
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
                {user.status == 2 ? _l('重新审核') : user.status == 3 ? _l('审批') : ''}
              </li>
            </React.Fragment>
          )}
          {(typeCursor === 0 || typeCursor === 1) && (
            <React.Fragment>
              <li className="opItem" onClick={handleEditUserClick}>
                {_l('编辑')}
              </li>
              {md.global.Config.IsLocal && !md.global.Config.IsPlatformLocal && (
                <li className="opItem" onClick={handleResetPasswordClick}>
                  {_l('重置密码')}
                </li>
              )}
              {departmentId && !isChargeUser && (
                <li
                  className="opItem"
                  onClick={e => {
                    e.stopPropagation();
                    this.props.changeOptListVisible();
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
                  onClick={e => {
                    e.stopPropagation();
                    this.props.changeOptListVisible();
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
    this.state = {
      showDialog: false,
      resetPasswordShowDialog: false,
      isMinSc: false, // document.body.clientWidth <= 1380
      showRefuseUserJoin: false,
      fullDepartmentInfo: {},
      password: '',
      optListVisible: false,
    };
  }

  componentDidMount() {
    const { accountId } = this.props;
    $(this.avatar).one('mouseover', () => {
      $(this.avatar)
        .mdBusinessCard({
          accountId,
        })
        .trigger('mouseenter');
    });
  }

  renderContact(user) {
    const { mobilePhone, isPrivateMobile } = user;
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
      sendNoticeInvite([accountId], '', projectId, type);
    };
  }

  handleRefuseClick = e => {
    e.stopPropagation();
    this.changeOptListVisible();
    this.setState({
      optListVisible: false,
      showRefuseUserJoin: true,
    });
  };

  handleApprovalClick = e => {
    e.stopPropagation();
    this.changeOptListVisible();
    this.props.clickRow();
  };

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

  handleEditUserClick = e => {
    e.stopPropagation();
    this.changeOptListVisible();
    this.props.clickRow();
  };

  handleRemoveUserClick = e => {
    e.stopPropagation();
    this.changeOptListVisible();
    const { accountId, projectId, user, departmentId, dispatch, pageIndex, typeCursor } = this.props;
    this.changeOptListVisible();
    TransferDialog({
      accountId,
      projectId,
      user: { ...user },
      success() {
        dispatch(emptyUserSet());
        refreshData(departmentId, typeCursor, projectId, 1, dispatch);
      },
    });
  };

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
    this.changeOptListVisible();
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
          alert(_l('设置失败'), 2);
        }
      });
  };

  changeOptListVisible = () => {
    this.setState({ optListVisible: !this.state.optListVisible });
  };

  handleResetPasswordClick = e => {
    e.stopPropagation();
    this.changeOptListVisible();
    this.setState({
      resetPasswordShowDialog: !this.state.resetPasswordShowDialog,
    });
  };

  renderResetPasswordInfo = () => {
    const { md = {} } = window;
    const { global = {} } = md;
    const { SysSettings = {} } = global;
    const { passwordRegexTip } = SysSettings;
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
          autocomplete="new-password"
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
      dispatch,
      fullDepartmentInfo = {},
      editCurrentUser = {},
    } = this.props;
    const { isMinSc, optListVisible } = this.state;
    let { jobs, departments, departmentInfos, jobInfos, department = '', job = '' } = user;
    let departmentData = departments || departmentInfos || [];
    let jobData = jobs || jobInfos;
    let totalColWidth = 0;
    columnsInfo.forEach(item => {
      if (isHideCurrentColumn(item.value)) {
        totalColWidth += item.width;
      }
    });
    let setWidth = $('.listInfo') && totalColWidth > $('.listInfo').width();

    return (
      <tr
        key={user.accountId}
        className={classNames('userItem Hand', {
          isChecked: isChecked,
          bgColor: editCurrentUser.accountId === user.accountId,
        })}
        onClick={this.props.clickRow}
      >
        {(typeCursor === 0 || typeCursor === 1) && (
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
              onClick={(checked, id, e) => {
                e.stopPropagation();
                this.handleCheckbox(isChecked, user.accountId);
              }}
            />
          </td>
        )}
        {isHideCurrentColumn('name') && (
          <td
            className={cx('nameTh', { left0: typeCursor !== 0, pLeft12: typeCursor !== 0 })}
            style={{ width: setWidth ? 200 : 'unset' }}
          >
            <div className="flexRow">
              <img src={user.avatar} alt="" className="avatar" ref={avatar => (this.avatar = avatar)} />
              <a className="overflow_ellipsis mLeft10 LineHeight32" title={user.fullname}>
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
        {isHideCurrentColumn('department') && (
          <td className="departmentTh">
            <div
              className="WordBreak overflow_ellipsis"
              onMouseEnter={() => {
                const departmentIds = departmentData.map(item => item.id || item.departmentId);
                dispatch(updateFullDepartmentInfo(projectId, departmentIds));
              }}
            >
              <Tooltip
                tooltipClass="departmentFullNametip"
                popupPlacement="bottom"
                text={
                  <div>
                    {(departmentData || []).map((it, depIndex) => {
                      const fullName = (fullDepartmentInfo[it.id] || fullDepartmentInfo[it.departmentId] || '').split(
                        '/',
                      );
                      return (
                        <div className={cx({ mBottom8: depIndex < departmentData.length - 1 })}>
                          {fullName.map((n, i) => (
                            <span>
                              {n}
                              {fullName.length - 1 > i && <span className="mLeft8 mRight8">/</span>}
                            </span>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                }
                mouseEnterDelay={0.5}
              >
                <span className="ellipsis InlineBlock wMax100 space">
                  {(departmentData || [])
                    .map(it => {
                      return `${it.name || it.departmentName}`;
                    })
                    .join('；')}
                </span>
              </Tooltip>
            </div>
          </td>
        )}
        {isHideCurrentColumn('position') && (
          <td className="jobTh">
            {
              <div
                className="job WordBreak overflow_ellipsis"
                title={(jobData || []).map((it, i) => {
                  if (jobData.length - 1 > i) {
                    return `${it.name || it.jobName};`;
                  }
                  return `${it.name || it.jobName}`;
                })}
              >
                {(jobData || []).map((it, i) => {
                  if (jobData.length - 1 > i) {
                    return `${it.name || it.jobName} ; `;
                  }
                  return `${it.name || it.jobName}`;
                })}
              </div>
            }
          </td>
        )}
        {isHideCurrentColumn('phone') && (
          <td className="mobileTh overflow_ellipsis WordBreak"> {this.renderContact(user)}</td>
        )}
        {!isMinSc && isHideCurrentColumn('email') && (
          <td className="emailTh overflow_ellipsis WordBreak">{this.renderEmail(user)}</td>
        )}
        {isHideCurrentColumn('jobNum') && <td className="jobNumberTh overflow_ellipsis WordBreak">{user.jobNumber}</td>}
        {isHideCurrentColumn('adress') && (
          <td className="workSiteTh overflow_ellipsis WordBreak">{user.workSiteName || user.workSite}</td>
        )}
        {isHideCurrentColumn('joinDate') && typeCursor === 0 && (
          <td className="joinDateTh">
            {user.addProjectTime
              ? moment(user.addProjectTime).format('YYYY-MM-DD')
              : moment(user.createTime).format('YYYY-MM-DD')}
          </td>
        )}
        {!isMinSc && typeCursor === 3 ? (
          <React.Fragment>
            {isHideCurrentColumn('applyDate') && (
              <td className="dateTh overflow_ellipsis WordBreak">{moment(user.updateTime).format('YYYY-MM-DD')}</td>
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

        <td className="actTh">
          <Trigger
            action={['click']}
            popupAlign={{ points: ['tl', 'bl'], offset: [-5, 0] }}
            popupVisible={optListVisible}
            onPopupVisibleChange={optListVisible => this.setState({ optListVisible })}
            popup={
              <OpList
                {...this.props}
                onClickAway={clearActiveDialog(this.props)}
                handleRemoveUserClick={this.handleRemoveUserClick}
                handleEditUserClick={this.handleEditUserClick}
                handleResetPasswordClick={this.handleResetPasswordClick}
                handleApprovalClick={this.handleApprovalClick}
                handleRefuseClick={this.handleRefuseClick}
                setAndCancelCharge={this.setAndCancelCharge}
                changeOptListVisible={this.changeOptListVisible}
                setValue={() => {
                  this.setState({
                    showDialog: false,
                  });
                }}
              />
            }
          >
            <span className="tip-top Hand" onClick={e => e.stopPropagation()}>
              <span className="icon-moreop TxtMiddle Font18 Gray_9e" />
            </span>
          </Trigger>
          {this.renderResetPasswordInfo()}
          {this.refuseUserJoin()}
        </td>
      </tr>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const {
    current: { projectId, departmentId, activeAccountId, selectedAccountIds, typeCursor, isSelectAll },
    entities: { fullDepartmentInfo = {} },
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
    fullDepartmentInfo,
  };
};

const connectedUserItem = connect(mapStateToProps)(UserItem);

export default connectedUserItem;
