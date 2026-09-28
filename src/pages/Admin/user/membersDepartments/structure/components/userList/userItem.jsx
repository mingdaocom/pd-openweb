import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import _ from 'lodash';
import { UserHead } from 'ming-ui';
import { Checkbox, Dropdown, Input, Modal, Tooltip } from 'ming-ui/antd-components';
import { withOpeners } from 'ming-ui/hooks/useFunctionWrapComponent';
import departmentController from 'src/api/department';
import userController from 'src/api/user';
import { checkCertification } from 'src/components/checkCertification';
import WorkHandoverDialog from 'src/pages/Admin/components/WorkHandoverDialog';
import TodoEntrustModal from 'src/pages/workflow/MyProcess/TodoEntrust/TodoEntrustModal';
import { PERMISSION_ENUM } from 'src/utils/domain/security/permission';
import { isPasswordValid } from 'src/utils/domain/security/verification';
import { dateConvertToUserZone } from 'src/utils/platform/runtime/timeZone';
import { encrypt } from 'src/utils/services/security/encryption';
import { hasPermission } from 'src/utils/services/security/permission';
import * as currentActions from '../../actions/current';
import * as entitiesActions from '../../actions/entities';
import { useHandoverDialog } from '../HandoverDialog';
import { useRefuseUserJoinDialog } from '../refuseUserJoinDia';
import './userItem.less';

const TABLE_CHECKBOX_STYLES = {
  icon: { marginTop: -2 },
};

class UserItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      resetPasswordShowDialog: false,
      isMinSc: false, // document.body.clientWidth <= 1380
      fullDepartmentInfo: {},
      password: '',
      optListVisible: false,
      password: '',
      isTopUp: props.user.displayOrder > 0,
    };
    this.requestPending = false;
  }

  updateFullDepartmentInfo = (projectId, departmentIds) => {
    const { fullDepartmentInfo = {} } = this.state;
    departmentIds = _.uniq(departmentIds).filter(it => it && !fullDepartmentInfo[it]);

    if (_.isEmpty(departmentIds)) {
      return;
    }

    departmentController
      .getDepartmentFullNameByIds({
        projectId,
        departmentIds,
      })
      .then(res => {
        this.setState(prevState => {
          const nextFullDepartmentInfo = { ...(prevState.fullDepartmentInfo || {}) };

          (res || []).forEach(it => {
            nextFullDepartmentInfo[it.id] = it.name;
          });

          return { fullDepartmentInfo: nextFullDepartmentInfo };
        });
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
          <div className="textTertiary ellipsis forRemind w100 overflow_ellipsis WordBreak">
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
          alert(_l('已成功发送提醒'), 1);
        });
    };
  }

  // 拒绝
  handleRefuseClick = () => {
    const { accountId, projectId } = this.props;

    this.props.openRefuseUserJoinDialog({
      projectId,
      accountIds: [accountId],
      callback: () => {
        this.props.fetchApproval();
        this.props.loadApprovalUsers(projectId, 1);
      },
    });
  };

  // 重新审批
  handleApprovalClick = () => {
    this.props.clickRow();
  };

  // 编辑
  handleEditUserClick = () => {
    this.props.clickRow();
  };

  // 交接工作
  handleTransfer = () => {
    this.setState({ showWorkHandover: true });
  };

  // 待办委托
  handleDelegate = () => {
    this.setState({ showDelegate: true });
  };

  // 离职
  handleRemoveUserClick = () => {
    const { accountId, projectId, user, departmentId, typeCursor } = this.props;

    this.props.openHandoverDialog({
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
  setAndCancelCharge = () => {
    let { typeCursor, projectId, departmentId, user = {}, departments } = this.props;
    const department = _.find(departments, d => d.departmentId === departmentId);

    if (department && department.disabled) {
      alert(user.isDepartmentChargeUser ? _l('已停用，无法取消部门负责人') : _l('已停用，无法设置部门负责人'), 3);
      return;
    }

    departmentController
      .editDepartmentSingleChargeUser({
        projectId,
        departmentId,
        chargeAccountId: user.accountId,
      })
      .then(res => {
        if (res) {
          alert(_l('设置成功'), 1);
          this.refreshData(departmentId, typeCursor, projectId);
        } else {
          alert(_l('设置失败'), 2);
        }
      });
  };

  // 重新邀请
  inviteAgain = () => {
    const { user = {} } = this.props;

    this.props.fetchReInvite([user.accountId]);
  };
  // 取消邀请并移除
  cancelInviteAndRemove = () => {
    const { projectId, user = {} } = this.props;

    Modal.confirm({
      className: 'deleteNodeConfirm',
      title: <span className="textError">{_l('确认取消邀请该用户吗')}</span>,
      content: '',
      okText: _l('确定'),
      onOk: () =>
        this.props.fetchCancelImportUser([user.accountId], () => {
          this.props.loadInactiveUsers(projectId, 1);
          this.props.fetchInActive(projectId);
        }),
    });
  };

  // 重置密码
  handleResetPasswordClick = () => {
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
      <Modal
        title={_l('重置密码')}
        mask={{ closable: true }}
        keyboard
        okText={_l('保存')}
        cancelText={_l('取消')}
        onCancel={() => {
          this.setState({ resetPasswordShowDialog: false });
        }}
        onOk={this.handleSavePassWord}
        open={this.state.resetPasswordShowDialog}
      >
        <div className="Font15 textPrimary mTop20 mBottom10">{_l('请输入新密码')}</div>
        <Input
          className="w100"
          type="password"
          autoComplete="new-password"
          value={this.state.password}
          placeholder={passwordRegexTip || _l('密码，8-20位，必须含字母+数字')}
          onChange={e => {
            this.setState({ password: e.target.value });
          }}
        />
      </Modal>
    );
  };

  handleSavePassWord = () => {
    if (this.requestPending) return;

    const { accountId, projectId } = this.props;
    const { password } = this.state;
    const { md = {} } = window;
    const { global = {} } = md;
    const { SysSettings = {} } = global;
    const { passwordRegexTip } = SysSettings;

    if (_.isEmpty(password)) {
      alert(_l('请输入新密码'), 3);
      return;
    } else if (!isPasswordValid(password)) {
      alert(passwordRegexTip || _l('密码过于简单，至少8~20位且含字母+数字'), 3);
      return;
    }

    this.requestPending = true;
    return userController
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
      })
      .finally(() => {
        this.requestPending = false;
      });
  };

  handleTopUp = () => {
    const { accountId, projectId, departmentId, typeCursor } = this.props;
    const { isTopUp } = this.state;
    const promiseFun = !isTopUp ? departmentController.setTopDisplayOrder : departmentController.cancelTopDisplayOrder;

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

  handleSort = () => {
    this.props.handleSortTopUp();
  };

  getActionItems = () => {
    const { user, typeCursor, departmentId, authority = [] } = this.props;
    const { isTopUp } = this.state;

    if (_.includes([0, 1], typeCursor)) {
      return [
        { key: 'edit', label: _l('编辑') },
        ...(departmentId
          ? [
              { key: 'topUp', label: isTopUp ? _l('取消置顶') : _l('置顶') },
              ...(isTopUp ? [{ key: 'sort', label: _l('排序') }] : []),
            ]
          : []),
        ...(!window.platformENV.isPlatform ? [{ key: 'resetPassword', label: _l('重置密码') }] : []),
        ...(departmentId
          ? [
              {
                key: 'departmentCharge',
                label: user.isDepartmentChargeUser ? _l('取消部门负责人') : _l('设为部门负责人'),
              },
            ]
          : []),
        ...(hasPermission(authority, PERMISSION_ENUM.DEPUTE_HANDOVER_MANAGE)
          ? [
              { key: 'transfer', label: _l('交接工作') },
              { key: 'delegate', label: _l('待办委托') },
            ]
          : []),
        ...(user.accountId !== md.global.Account.accountId ? [{ key: 'remove', danger: true, label: _l('离职') }] : []),
      ];
    }

    if (typeCursor === 2) {
      return [
        { key: 'inviteAgain', label: _l('重新邀请') },
        { key: 'cancelInvite', label: _l('取消邀请并移除') },
      ];
    }

    if (_.includes([2, 3], user.status)) {
      return [
        {
          key: 'approval',
          label: user.status == 2 ? _l('重新审批') : user.status == 3 ? _l('批准加入') : '',
        },
        ...(user.status == 3 ? [{ key: 'refuse', label: _l('拒绝加入') }] : []),
      ];
    }

    return [];
  };

  handleActionClick = ({ key, domEvent }) => {
    const { projectId } = this.props;
    const actionHandlers = {
      edit: this.handleEditUserClick,
      topUp: this.handleTopUp,
      sort: this.handleSort,
      resetPassword: this.handleResetPasswordClick,
      departmentCharge: this.setAndCancelCharge,
      transfer: this.handleTransfer,
      delegate: this.handleDelegate,
      remove: this.handleRemoveUserClick,
      inviteAgain: () => checkCertification({ projectId, checkSuccess: this.inviteAgain }),
      cancelInvite: this.cancelInviteAndRemove,
      approval: () => checkCertification({ projectId, checkSuccess: this.handleApprovalClick }),
      refuse: this.handleRefuseClick,
    };

    domEvent.stopPropagation();
    this.setState({ optListVisible: false });
    actionHandlers[key]?.();
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
      nameColumnStyle,
      editCurrentUser = {},
      departmentId,
      isLastTopUp,
    } = this.props;
    const { isMinSc, optListVisible, showWorkHandover, showDelegate, isTopUp, fullDepartmentInfo = {} } = this.state;
    let { jobs, departments, departmentInfos, jobInfos, isDepartmentChargeUser } = user;
    let departmentData = departmentId ? departmentInfos || [] : departments || departmentInfos || [];
    const orgRoleInfos = typeCursor === 2 ? user.orgRoleInfos : user.orgRoles;
    let jobData = jobs || jobInfos;
    const departmentText = departmentData.map(it => it.name || it.departmentName).join('；');
    const orgRoleText = (orgRoleInfos || []).map(it => it.name).join('；');
    const jobText = (jobData || []).map(item => item.name || item.jobName).join(';');

    return (
      <Fragment>
        <tr
          key={user.accountId}
          className={cx('userItem Hand', {
            isChecked: isChecked,
            bgColor: editCurrentUser.accountId === user.accountId,
            topUp: isTopUp,
            lastTopUp: isLastTopUp,
          })}
          onClick={this.props.clickRow}
        >
          <td
            className={cx('checkBox', {
              showCheckBox: isChecked,
              hasSelectCount: selectCount > 0,
              // opacity0: typeCursor === 2 || typeCursor === 3,
            })}
          >
            <Checkbox
              key={`checkBox-${user.accountId}`}
              className="TxtMiddle"
              checked={isChecked}
              styles={TABLE_CHECKBOX_STYLES}
              onClick={event => event.stopPropagation()}
              onChange={event => {
                event.stopPropagation();
                this.handleCheckbox(isChecked, user.accountId);
              }}
            />
          </td>
          {isHideCurrentColumn('name', columnsInfo) && (
            <td className="nameTh" style={nameColumnStyle}>
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
                  <Tooltip title={_l('部门负责人')}>
                    <span className="icon-ic-head Font16 mLeft5 chargeIcon" title={_l('部门负责人')} />
                  </Tooltip>
                ) : null}
              </div>
            </td>
          )}
          {isHideCurrentColumn('department', columnsInfo) && (
            <td className="departmentTh">
              <div
                className="WordBreak overflow_ellipsis"
                onMouseEnter={() => {
                  const departmentIds = departmentData.map(item => item.id || item.departmentId);
                  this.updateFullDepartmentInfo(projectId, departmentIds);
                }}
              >
                <Tooltip
                  placement="bottom"
                  title={
                    <div>
                      {(departmentData || []).map((it, depIndex) => {
                        const fullName = (fullDepartmentInfo[it.id] || fullDepartmentInfo[it.departmentId] || '').split(
                          '/',
                        );
                        return (
                          <div
                            key={it.id || it.departmentId}
                            className={cx({ mBottom8: depIndex < departmentData.length - 1 })}
                          >
                            {fullName.map((n, i) => (
                              <span key={`${it.id || it.departmentId}-${i}`}>
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
                  <span className="ellipsis InlineBlock wMax100 space">{departmentText}</span>
                </Tooltip>
              </div>
            </td>
          )}
          {isHideCurrentColumn('role', columnsInfo) && (
            <td className="roleTh">
              <div className="WordBreak overflow_ellipsis">
                <span className="ellipsis InlineBlock wMax100 space" title={orgRoleText}>
                  {orgRoleText}
                </span>
              </div>
            </td>
          )}
          {isHideCurrentColumn('position', columnsInfo) && (
            <td className="jobTh">
              <div className="job WordBreak overflow_ellipsis" title={jobText}>
                {jobText}
              </div>
            </td>
          )}
          {isHideCurrentColumn('phone', columnsInfo) && (
            <td className="mobileTh overflow_ellipsis WordBreak"> {this.renderContact(user)}</td>
          )}
          {!isMinSc && isHideCurrentColumn('email', columnsInfo) && (
            <td className="emailTh overflow_ellipsis WordBreak">{this.renderEmail(user)}</td>
          )}
          {isHideCurrentColumn('jobNum', columnsInfo) && (
            <td className="jobNumberTh overflow_ellipsis WordBreak">{user.jobNumber}</td>
          )}
          {isHideCurrentColumn('adress', columnsInfo) && (
            <td className="workSiteTh overflow_ellipsis WordBreak">{user.workSiteName || user.workSite}</td>
          )}
          {isHideCurrentColumn('joinDate', columnsInfo) && typeCursor === 0 && (
            <td className="joinDateTh">
              {user.addProjectTime
                ? createTimeSpan(dateConvertToUserZone(user.addProjectTime))
                : createTimeSpan(dateConvertToUserZone(user.createTime))}
            </td>
          )}
          {!isMinSc && typeCursor === 3 && (
            <Fragment>
              {isHideCurrentColumn('applyDate', columnsInfo) && (
                <td className="dateTh overflow_ellipsis WordBreak">
                  {createTimeSpan(dateConvertToUserZone(user.createTime))}
                </td>
              )}
              {isHideCurrentColumn('operator', columnsInfo) && (
                <td className="actMenTh overflow_ellipsis WordBreak">
                  {!user.lastModifyUser || !user.lastModifyUser.fullname ? '' : user.lastModifyUser.fullname}
                </td>
              )}
            </Fragment>
          )}

          <td className="actTh">
            <Dropdown
              placement="bottomRight"
              trigger={['click']}
              open={optListVisible}
              onOpenChange={optListVisible => this.setState({ optListVisible })}
              menu={{
                items: this.getActionItems(),
                onClick: this.handleActionClick,
                style: { minWidth: 120 },
              }}
            >
              <span className="Hand" onClick={e => e.stopPropagation()}>
                <span className="icon-moreop TxtMiddle Font18 textTertiary" />
              </span>
            </Dropdown>
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
            setTodoEntrustModalVisible={() => this.setState({ showDelegate: false })}
          />
        )}
      </Fragment>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const {
    entities: { departments },
    current: { projectId, departmentId, selectedAccountIds, typeCursor, isSelectAll },
  } = state;
  const { accountId } = ownProps.user;
  const isChecked = _.some(selectedAccountIds, id => id === accountId) || isSelectAll;
  return {
    accountId,
    isChecked,
    projectId,
    departmentId,
    typeCursor,
    selectCount: selectedAccountIds.length,
    departments,
  };
};

const connectedUserItem = connect(mapStateToProps, dispatch =>
  bindActionCreators({ ...entitiesActions, ...currentActions }, dispatch),
)(UserItem);

export default withOpeners(connectedUserItem, {
  openRefuseUserJoinDialog: useRefuseUserJoinDialog,
  openHandoverDialog: useHandoverDialog,
});
