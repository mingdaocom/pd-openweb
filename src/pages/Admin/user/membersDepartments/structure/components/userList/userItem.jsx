import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import cx from 'classnames';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import { Checkbox, Dialog, Input, Menu, MenuItem, Tooltip, UserHead } from 'ming-ui';
import Confirm from 'ming-ui/components/Dialog/Confirm';
import departmentController from 'src/api/department';
import userController from 'src/api/user';
import { checkCertification } from 'src/components/checkCertification';
import { hasPermission } from 'src/components/checkPermission';
import WorkHandoverDialog from 'src/pages/Admin/components/WorkHandoverDialog';
import { PERMISSION_ENUM } from 'src/pages/Admin/enum';
import TodoEntrustModal from 'src/pages/workflow/MyProcess/TodoEntrust/TodoEntrustModal';
import { encrypt } from 'src/utils/common';
import RegExpValidator from 'src/utils/expression';
import { dateConvertToUserZone } from 'src/utils/project';
import * as currentActions from '../../actions/current';
import * as entitiesActions from '../../actions/entities';
import { handoverDialog } from '../HandoverDialog';
import { refuseUserJoinFunc } from '../refuseUserJoinDia';
import './userItem.less';

class UserItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      resetPasswordShowDialog: false,
      isMinSc: false, // document.body.clientWidth <= 1380
      fullDepartmentInfo: {},
      password: '',
      optListVisible: false,
      isTopUp: props.user.displayOrder > 0,
    };
  }

  updateFullDepartmentInfo = (projectId, departmentIds) => {
    const { fullDepartmentInfo = {} } = this.state;
    const copyFullDepartmentInfo = _.clone(fullDepartmentInfo);
    departmentIds = departmentIds.filter(it => !copyFullDepartmentInfo[it]);
    if (_.isEmpty(departmentIds)) {
      return;
    }
    departmentController
      .getDepartmentFullNameByIds({
        projectId,
        departmentIds,
      })
      .then(res => {
        (res || []).forEach(it => {
          copyFullDepartmentInfo[it.id] = it.name;
        });

        this.setState({ fullDepartmentInfo: copyFullDepartmentInfo });
      });
  };

  refreshData = (departmentId, typeCursor, projectId, pageIndex = 1) => {
    if (departmentId) {
      this.props.loadUsers(departmentId, pageIndex);
    } else {
      switch (typeCursor) {
        case 0:
          this.props.loadAllUsers(projectId, pageIndex);
          break;
        case 1:
          this.props.loadUsers(departmentId, pageIndex);
          break;
        case 2:
          this.props.loadInactiveUsers(projectId, pageIndex);
          break;
        case 3:
          this.props.loadApprovalUsers(projectId, pageIndex);
          break;
      }
    }
  };

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
          <span title={_l('保密')} className="overflow_ellipsis" style={{ maxWidth: 130 }}>
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
        <span title={_l('保密')} className="overflow_ellipsis" style={{ maxWidth: 130 }}>
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

      if (!accountId) {
        alert(_l('没有要提醒的人'), 4);
        return;
      }

      userController
        .sendNotice({
          accountIds: [accountId],
          projectId,
          type,
        })
        .then(() => {
          alert('已成功发送提醒', 1);
        });
    };
  }

  clickEvent = e => {
    e.stopPropagation();
    this.setState({ optListVisible: !this.state.optListVisible });
  };

  // 拒绝
  handleRefuseClick = e => {
    const { accountId, projectId } = this.props;

    this.clickEvent(e);
    refuseUserJoinFunc({
      projectId,
      accountIds: [accountId],
      callback: () => {
        this.props.fetchApproval();
        this.props.loadApprovalUsers(projectId, 1);
      },
    });
  };

  // 重新审批
  handleApprovalClick = e => {
    this.clickEvent(e);
    this.props.clickRow();
  };

  // 编辑
  handleEditUserClick = e => {
    this.clickEvent(e);
    this.props.clickRow();
  };

  // 交接工作
  handleTransfer = e => {
    this.clickEvent(e);
    this.setState({ showWorkHandover: true });
  };

  // 待办委托
  handleDelegate = e => {
    this.clickEvent(e);
    this.setState({ showDelegate: true });
  };

  // 离职
  handleRemoveUserClick = e => {
    const { accountId, projectId, user, departmentId, typeCursor } = this.props;

    this.clickEvent(e);
    handoverDialog({
      accountId,
      projectId,
      user: { ...user },
      success: () => {
        this.props.emptyUserSet();
        this.refreshData(departmentId, typeCursor, projectId);
      },
    });
  };

  handleCheckbox = (isChecked, accountId) => {
    if (!isChecked) {
      this.props.addUserToSet([accountId]);
    } else {
      this.props.removeUserFromSet([accountId]);
    }
  };

  // 设为/取消部门负责人
  setAndCancelCharge = e => {
    let { typeCursor, projectId, departmentId, user = {} } = this.props;

    this.clickEvent(e);
    departmentController
      .editDepartmentSingleChargeUser({
        projectId,
        departmentId,
        chargeAccountId: user.accountId,
      })
      .then(res => {
        if (res) {
          alert(_l('设置成功', 1));
          this.refreshData(departmentId, typeCursor, projectId);
        } else {
          alert(_l('设置失败'), 2);
        }
      });
  };

  // 重新邀请
  inviteAgain = e => {
    const { user = {} } = this.props;

    this.clickEvent(e);
    this.props.fetchReInvite([user.accountId]);
  };
  // 取消邀请并移除
  cancelInviteAndRemove = e => {
    const { projectId, user = {} } = this.props;

    this.clickEvent(e);
    Confirm({
      className: 'deleteNodeConfirm',
      title: _l('确认取消邀请该用户吗'),
      description: '',
      okText: _l('确定'),
      onOk: () =>
        this.props.fetchCancelImportUser([user.accountId], () => {
          this.props.loadInactiveUsers(projectId, 1);
          this.props.fetchInActive(projectId);
        }),
    });
  };

  // 重置密码
  handleResetPasswordClick = e => {
    this.clickEvent(e);
    this.setState({ resetPasswordShowDialog: !this.state.resetPasswordShowDialog });
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
    const { passwordRegexTip } = SysSettings;
    if (_.isEmpty(password)) {
      alert(_l('请输入新密码'), 3);
      return;
    } else if (!RegExpValidator.isPasswordValid(password)) {
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

  handleTopUp = e => {
    const { accountId, projectId, departmentId, typeCursor } = this.props;
    const { isTopUp } = this.state;
    const promiseFun = !isTopUp ? departmentController.setTopDisplayOrder : departmentController.cancelTopDisplayOrder;

    this.clickEvent(e);

    promiseFun({
      projectId,
      departmentId,
      memberId: accountId,
    }).then(res => {
      if (res) {
        alert(isTopUp ? _l('取消置顶成功') : _l('置顶成功'));
        this.setState({ isTopUp: !isTopUp });
        this.refreshData(departmentId, typeCursor, projectId);
      } else {
        alert(isTopUp ? _l('取消置顶失败') : _l('置顶失败'), 2);
      }
    });
  };

  handleSort = e => {
    this.clickEvent(e);
    this.props.handleSortTopUp();
  };

  renderAction = () => {
    const { user, typeCursor, departmentId, authority = [], projectId } = this.props;
    const { isTopUp } = this.state;

    return _.includes([0, 1], typeCursor) ? (
      <Menu className="userOptList">
        <MenuItem onClick={this.handleEditUserClick}> {_l('编辑')}</MenuItem>
        {!!departmentId && (
          <Fragment>
            <MenuItem onClick={this.handleTopUp}>{isTopUp ? _l('取消置顶') : _l('置顶')}</MenuItem>
            {isTopUp && <MenuItem onClick={this.handleSort}>{_l('排序')}</MenuItem>}
          </Fragment>
        )}

        {md.global.Config.IsLocal && !md.global.Config.IsPlatformLocal && (
          <MenuItem onClick={this.handleResetPasswordClick}> {_l('重置密码')}</MenuItem>
        )}
        {departmentId && !user.isDepartmentChargeUser && (
          <MenuItem onClick={this.setAndCancelCharge}>{_l('设为部门负责人')}</MenuItem>
        )}
        {departmentId && user.isDepartmentChargeUser && (
          <MenuItem onClick={this.setAndCancelCharge}>{_l('取消部门负责人')}</MenuItem>
        )}
        {hasPermission(authority, PERMISSION_ENUM.DEPUTE_HANDOVER_MANAGE) && (
          <Fragment>
            <MenuItem onClick={this.handleTransfer}> {_l('交接工作')}</MenuItem>
            <MenuItem onClick={this.handleDelegate}> {_l('待办委托')}</MenuItem>
          </Fragment>
        )}
        {user.accountId !== md.global.Account.accountId && (
          <MenuItem className="leaveText" onClick={this.handleRemoveUserClick}>
            {_l('离职')}
          </MenuItem>
        )}
      </Menu>
    ) : typeCursor === 2 ? (
      <Menu className="userOptList">
        <MenuItem
          onClick={e => {
            e.stopPropagation();
            this.setState({ optListVisible: false });
            checkCertification({ projectId, checkSuccess: this.inviteAgain.bind(this, e) });
          }}
        >
          {_l('重新邀请')}
        </MenuItem>
        <MenuItem onClick={this.cancelInviteAndRemove}>{_l('取消邀请并移除')}</MenuItem>
      </Menu>
    ) : _.includes([2, 3], user.status) ? (
      <Menu className="userOptList">
        <MenuItem
          onClick={e => {
            e.stopPropagation();
            this.setState({ optListVisible: false });
            checkCertification({ projectId, checkSuccess: this.handleApprovalClick.bind(this, e) });
          }}
        >
          {user.status == 2 ? _l('重新审批') : user.status == 3 ? _l('批准加入') : ''}
        </MenuItem>
        {user.status == 3 && <MenuItem onClick={this.handleRefuseClick}>{_l('拒绝加入')}</MenuItem>}
      </Menu>
    ) : (
      <Fragment></Fragment>
    );
  };

  render() {
    const {
      user,
      isChecked,
      typeCursor,
      projectId,
      selectCount,
      isHideCurrentColumn,
      columnsInfo = [],
      editCurrentUser = {},
      departmentId,
    } = this.props;
    const { isMinSc, optListVisible, showWorkHandover, showDelegate, isTopUp,  fullDepartmentInfo = {}} = this.state;
    let { jobs, departments, departmentInfos, jobInfos, isDepartmentChargeUser } = user;
    let departmentData = departmentId ? departmentInfos : departments || departmentInfos || [];
    const orgRoleInfos = typeCursor === 2 ? user.orgRoleInfos : user.orgRoles;
    let jobData = jobs || jobInfos;
    let totalColWidth = 0;
    columnsInfo.forEach(item => {
      if (isHideCurrentColumn(item.value)) {
        totalColWidth += item.width;
      }
    });
    let setWidth = $('.listInfo') && totalColWidth > $('.listInfo').width();

    return (
      <Fragment>
        <tr
          key={user.accountId}
          className={classNames('userItem Hand', {
            isChecked: isChecked,
            bgColor: editCurrentUser.accountId === user.accountId,
            topUp: isTopUp,
          })}
          onClick={this.props.clickRow}
        >
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
          {isHideCurrentColumn('name') && (
            <td
              className={cx('nameTh', { left0: typeCursor !== 0, pLeft12: typeCursor !== 0 })}
              style={{ width: setWidth ? 200 : 'unset' }}
            >
              <div className="flexRow">
                <UserHead
                  className="avatar"
                  user={{
                    userHead: user.avatar,
                    accountId: user.accountId,
                  }}
                  size={32}
                  projectId={projectId}
                />
                <a className="overflow_ellipsis mLeft10 LineHeight32" title={user.fullname}>
                  {user.fullname}
                </a>
                {isDepartmentChargeUser ? (
                  <Tooltip text={<span>{_l('部门负责人')}</span>} action={['hover']}>
                    <span className="icon-ic-head Font16 mLeft5 chargeIcon" title={_l('部门负责人')} />
                  </Tooltip>
                ) : null}
              </div>
            </td>
          )}
          {isHideCurrentColumn('department') && (
            <td className="departmentTh">
              <div
                className="WordBreak overflow_ellipsis"
                onMouseEnter={() => {
                  const departmentIds = departmentData.map(item => item.id || item.departmentId);
                  this.updateFullDepartmentInfo(projectId, departmentIds);
                }}
              >
                <Tooltip
                  action={['hover']}
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
          {isHideCurrentColumn('role') && (
            <td className="roleTh">
              <div className="WordBreak overflow_ellipsis">
                <span
                  className="ellipsis InlineBlock wMax100 space"
                  title={(orgRoleInfos || []).map(it => it.name).join('；')}
                >
                  {(orgRoleInfos || []).map(it => it.name).join('；')}
                </span>
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
          {isHideCurrentColumn('jobNum') && (
            <td className="jobNumberTh overflow_ellipsis WordBreak">{user.jobNumber}</td>
          )}
          {isHideCurrentColumn('adress') && (
            <td className="workSiteTh overflow_ellipsis WordBreak">{user.workSiteName || user.workSite}</td>
          )}
          {isHideCurrentColumn('joinDate') && typeCursor === 0 && (
            <td className="joinDateTh">
              {user.addProjectTime
                ? createTimeSpan(dateConvertToUserZone(user.addProjectTime))
                : createTimeSpan(dateConvertToUserZone(user.createTime))}
            </td>
          )}
          {!isMinSc && typeCursor === 3 && (
            <Fragment>
              {isHideCurrentColumn('applyDate') && (
                <td className="dateTh overflow_ellipsis WordBreak">
                  {createTimeSpan(dateConvertToUserZone(user.updateTime))}
                </td>
              )}
              {isHideCurrentColumn('operator') && (
                <td className="actMenTh overflow_ellipsis WordBreak">
                  {!user.lastModifyUser || !user.lastModifyUser.fullname ? '' : user.lastModifyUser.fullname}
                </td>
              )}
            </Fragment>
          )}

          <td className="actTh">
            <Trigger
              action={['click']}
              popupAlign={{
                points: ['tl', 'bl'],
                offset: [-20, 0],
                overflow: { adjustX: true, adjustY: true },
              }}
              popupVisible={optListVisible}
              onPopupVisibleChange={optListVisible => this.setState({ optListVisible })}
              popup={this.renderAction}
            >
              <span className="tip-top Hand" onClick={e => e.stopPropagation()}>
                <span className="icon-moreop TxtMiddle Font18 Gray_9e" />
              </span>
            </Trigger>
          </td>
        </tr>
        {this.renderResetPasswordInfo()}
        {showWorkHandover && (
          <WorkHandoverDialog
            visible={showWorkHandover}
            projectId={projectId}
            transferor={user}
            onCancel={() => this.setState({ showWorkHandover: false })}
          />
        )}
        {showDelegate && (
          <TodoEntrustModal
            type={2}
            defaultValue={{
              principal: _.pick(user, ['accountId', 'avatar', 'fullname']),
            }}
            companyId={projectId}
            setTodoEntrustModalVisible={e => this.setState({ showDelegate: false })}
          />
        )}
      </Fragment>
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

const connectedUserItem = connect(mapStateToProps, dispatch =>
  bindActionCreators({ ...entitiesActions, ...currentActions }, dispatch),
)(UserItem);

export default connectedUserItem;
