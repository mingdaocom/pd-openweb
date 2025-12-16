import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { ActionSheet, Button, Dialog, List, SpinLoading } from 'antd-mobile';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import AppManagement from 'src/api/appManagement.js';
import { userStatusList } from 'src/pages/Role/AppRoleCon/UserCon/config.js';
import { sysRoleType } from 'src/pages/Role/config.js';
import { APP_ROLE_TYPE } from 'src/pages/worksheet/constants/enum.js';
import { getUserRole } from 'src/pages/worksheet/redux/actions/util';
import Back from '../../components/Back';
import SelectJob from '../../components/SelectJob';
import SelectOrgRole from '../../components/SelectOrgRole';
import SelectUser from '../../components/SelectUser';
import noMmberImg from '../img/noMember.png';
import * as actions from './redux/actions';
import './index.less';

let modal = null;
class MemberList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectUserVisible: false,
      transferAppVisible: false,
      type: 'user',
      selectDepartmentType: '', // current: 仅当前部门， all: 选择当前部门下所有子部门
      selectJobVisible: false,
      selectOrgnizedRoleVisible: false,
      personalInfoVisible: false,
      accountId: null,
    };
  }

  componentDidMount() {
    const { params } = this.props.match;
    this.props.dispatch(actions.getMembersList(params.appId, params.roleId));
    $('html').addClass('memberListCon');
  }

  componentWillUnmount() {
    $('html').removeClass('memberListCon');
    if (modal) {
      modal.close();
    } else {
      modal = null;
    }
    this.actionSheetHandler && this.actionSheetHandler.close();
    this.actionDepartmentHandler && this.actionDepartmentHandler.close();
    this.actionUserHandler && this.actionUserHandler.close();
  }

  showActionSheet = () => {
    const { detail } = this.props.memberList;
    const addUser = { name: _l('添加人员'), icon: 'hr_person_add', iconClass: 'Font20' };
    const BUTTONS = detail.projectId
      ? [
          addUser,
          { name: _l('添加部门'), icon: 'department', iconClass: 'Font22' },
          { name: _l('添加职位'), icon: 'limit-principal', iconClass: 'Font20' },
          { name: _l('添加组织角色'), icon: 'group', iconClass: 'Font22' },
        ]
      : [addUser];
    this.actionSheetHandler = ActionSheet.show({
      actions: BUTTONS.map((item, index) => {
        return {
          key: index,
          text: (
            <Fragment>
              <Icon className={cx('mRight15 Gray_9e', item.iconClass)} icon={item.icon} />
              <span className="Bold">{item.name}</span>
            </Fragment>
          ),
        };
      }),
      extra: (
        <div className="flexRow header">
          <span className="Font13">{_l('人员管理')}</span>
          <div className="closeIcon" onClick={() => this.actionSheetHandler.close()}>
            <Icon icon="close" />
          </div>
        </div>
      ),
      onAction: (action, index) => {
        if (index === 0) {
          this.setState({
            type: 'user',
            selectUserVisible: true,
          });
        }
        if (index === 1 && detail.projectId) {
          this.showActionDepartment();
        }
        if (index === 2 && detail.projectId) {
          this.setState({ selectJobVisible: true, type: 'job' });
        }
        if (index === 3 && detail.projectId) {
          this.setState({ selectOrgnizedRoleVisible: true, type: 'orgnizeRole' });
        }
        this.actionSheetHandler.close();
      },
    });
  };
  showActionDepartment = () => {
    const BUTTONS = [
      { name: _l('仅选择当前部门'), selectValue: 'current' },
      { name: _l('选择当前部门下所有子部门'), selectValue: 'all' },
    ];
    this.actionDepartmentHandler = ActionSheet.show({
      actions: BUTTONS.map((item, index) => {
        return {
          key: index,
          text: <span className="Bold">{item.name}</span>,
        };
      }),
      extra: (
        <div className="flexRow header">
          <span className="Font13">
            <Icon
              icon="backspace"
              className="mRight10"
              onClick={() => {
                this.actionDepartmentHandler.close();
                this.showActionSheet();
              }}
            />
            {_l('添加部门')}
          </span>
          <div
            className="closeIcon"
            onClick={() => {
              this.actionDepartmentHandler.close();
              this.showActionSheet();
            }}
          >
            <Icon icon="close" />
          </div>
        </div>
      ),
      onAction: (action, index) => {
        this.setState({
          type: 'department',
          selectUserVisible: true,
          selectDepartmentType: index === 0 ? 'current' : 'all',
        });
        this.actionDepartmentHandler.close();
      },
    });
  };

  handleSave = items => {
    const { detail } = this.props.memberList;
    const { params } = this.props.match;
    const { type, selectDepartmentType } = this.state;

    const departmentIds = _.map(items, ({ departmentId }) => departmentId);

    this.props.dispatch(
      actions.addRoleMembers({
        projectId: detail.projectId,
        appId: params.appId,
        roleId: params.roleId,
        users: type === 'user' ? items : [],
        departmentTreeIds: type === 'department' && selectDepartmentType === 'all' ? departmentIds : [],
        departmentIds: type === 'department' && selectDepartmentType === 'current' ? departmentIds : [],
        jobIds: type === 'job' ? items.map(item => item.jobId) : [],
        projectOrganizeIds: type === 'orgnizeRole' ? (items || []).map(item => item.organizeId) : [],
      }),
    );
  };

  showActionUserSheet = ({
    accountId = undefined,
    departmentId = undefined,
    departmentTreeId = undefined,
    projectOrganizeId = undefined,
    jobId = undefined,
    isRoleCharger,
    roleType,
    roleId,
    memberCategory,
    isOwner,
    memberId,
  }) => {
    const { debugRoles } = this.props;
    const { detail } = this.props.memberList;
    const { params } = this.props.match;
    const isSysRole = sysRoleType.includes(roleType); // 系统角色
    const isMe = accountId === md.global.Account.accountId; // 当前用户本人
    const isAdmin = detail.permissionType === APP_ROLE_TYPE.ADMIN_ROLE;
    let BUTTONS = [
      isRoleCharger
        ? { name: _l('取消角色负责人'), icon: 'people_5', iconClass: 'Gray_9e Font18' }
        : { name: _l('设为角色负责人'), icon: 'people_5', iconClass: 'Gray_9e Font18' },
      { name: _l('移到其他角色'), icon: 'loop', iconClass: 'Gray_9e Font18' },
      isSysRole && isAdmin && isMe && !((detail.debugRole || {}).canDebug && !_.isEmpty(debugRoles))
        ? { name: _l('退出'), icon: 'exit_to_app', iconClass: 'Font20' }
        : { name: _l('移除'), icon: 'trash', iconClass: 'Font18' },
    ];
    const BUTTONS_Owers = [{ name: _l('将应用托付给他人'), icon: 'forward2', iconClass: 'Gray_9e' }];
    const isAllOrganization = departmentId && departmentId.includes('org'); // 全组织不支持设为角色负责人

    if ((isSysRole && !(isOwner && isMe)) || isAllOrganization || (!isSysRole && !accountId)) {
      // 普通角色非人员||系统角色
      BUTTONS = BUTTONS.filter((it, index) => index !== 0);
    } else if (isSysRole && isOwner && isMe) {
      // 系统角色&当前用户为拥有者
      BUTTONS = BUTTONS_Owers;
    }
    this.actionUserHandler = ActionSheet.show({
      actions: BUTTONS.map((item, index) => {
        return {
          key: index,
          text: (
            <div
              className={cx('flexRow alignItemsCenter', {
                Red: ['exit_to_app', 'trash'].includes(item.icon),
              })}
            >
              <Icon className={cx('mRight10', item.iconClass)} icon={item.icon} />
              <span className="Bold">{item.name}</span>
            </div>
          ),
        };
      }),
      extra: (
        <div className="flexRow header">
          <span className="Font13">{_l('人员管理')}</span>
          <div className="closeIcon" onClick={() => this.actionUserHandler.close()}>
            <Icon icon="close" />
          </div>
        </div>
      ),
      onAction: (action, buttonIndex) => {
        if (!isSysRole && buttonIndex === 0 && !isAllOrganization && !!accountId) {
          const param = {
            appId: params.appId,
            memberCategory,
            memberId,
            roleId,
          };
          if (isRoleCharger) {
            AppManagement.cancelRoleCharger(param).then(res => {
              if (res) {
                this.props.dispatch(actions.getMembersList(params.appId, params.roleId));
                alert(_l('设置成功'));
              } else {
                alert(_l('设置失败'), 2);
              }
            });
          } else {
            Dialog.confirm({
              title: <span className="Font16 Gray bold">{_l('确认设置为角色负责人？')}</span>,
              content: (
                <div className="Font13 Gray pLeft15 pRight15">{_l('角色负责人可添加、移出当前角色下的成员')}</div>
              ),
              onConfirm: () => {
                AppManagement.setRoleCharger(param).then(res => {
                  if (res) {
                    this.props.dispatch(actions.getMembersList(params.appId, params.roleId));
                    alert(_l('设置成功'));
                  } else {
                    alert(_l('设置失败'), 2);
                  }
                });
              },
            });
          }
        } else if (isSysRole && isOwner && isMe && buttonIndex === 0) {
          // 将应用托付给他人
          this.setState({
            transferAppVisible: true,
          });
        } else if (
          (!isSysRole && buttonIndex === 1 && !isAllOrganization && !!accountId) ||
          (((isSysRole && !(isOwner && isMe)) || isAllOrganization || (!isSysRole && !accountId)) && buttonIndex === 0)
        ) {
          // 移到其他角色
          this.props.history.push(
            `/mobile/changeRole/${!detail.projectId ? 'individual' : detail.projectId}/${params.appId}/${
              params.roleId
            }/${accountId}/${departmentId}/${departmentTreeId}/${projectOrganizeId}/${jobId}`,
          );
        } else if (
          (!isSysRole && buttonIndex === 2) ||
          (((isSysRole && !(isOwner && isMe)) || isAllOrganization || (!isSysRole && !accountId)) && buttonIndex === 1)
        ) {
          if (isSysRole && isAdmin && isMe && !((detail.debugRole || {}).canDebug && !_.isEmpty(debugRoles))) {
            // 退出
            Dialog.confirm({
              content: _l('确认退出此角色吗 ?'),
              onConfirm: () => {
                this.props.dispatch(
                  actions.exitRole({
                    roleId: params.roleId,
                    appId: params.appId,
                    callback: () => {
                      this.props.history.push(`/mobile/dashboard`);
                    },
                  }),
                );
              },
            });
            return;
          }
          // 移除
          Dialog.confirm({
            content: _l('是否移除该成员？'),
            confirmText: <span className="Red">{_l('移除')}</span>,
            onConfirm: () => {
              this.props.dispatch(
                actions.removeUserFromRole({
                  projectId: detail.projectId,
                  appId: params.appId,
                  roleId: params.roleId,
                  userIds: accountId ? [accountId] : [],
                  departmentIds: departmentId ? [departmentId] : [],
                  departmentTreeIds: departmentTreeId ? [departmentTreeId] : [],
                  projectOrganizeIds: projectOrganizeId ? [projectOrganizeId] : [],
                  jobIds: jobId ? [jobId] : [],
                }),
              );
            },
          });
        }
        this.actionUserHandler.close();
      },
    });
  };

  // openPersonalInfoPopup = (e, accountId) => {
  //   e.stopPropagation();
  //   this.setState({
  //     personalInfoVisible: true,
  //     accountId,
  //   });
  // };

  closePersonalInfoPopup = () => {
    this.setState({
      personalInfoVisible: false,
      accountId: null,
    });
  };

  renderUserTag = (roleType, isOwner) => {
    if (isOwner) {
      return (
        <span className="memberTag">
          <span className="ownerTag">{_l('拥有者')}</span>
        </span>
      );
    }
  };

  renderBase = () => {
    const { detail, list = [] } = this.props.memberList;
    const { selectJobVisible, selectOrgnizedRoleVisible } = this.state;
    const { params } = this.props.match;
    const data = _.find(list, item => item.roleId === params.roleId) || {};
    let { isAdmin } = getUserRole(detail.permissionType);
    const canAddUser =
      (data.canSetMembers || isAdmin) &&
      !(detail.permissionType === APP_ROLE_TYPE.RUNNER_ROLE && ['all', 'apply', 'outsourcing'].includes(data.roleId));

    return (
      <Fragment>
        <Back
          className={cx({ bottom55: canAddUser })}
          onClick={() => {
            this.props.history.push(`/mobile/members/${detail.id}`);
          }}
        />
        {this.state.selectUserVisible && (
          <SelectUser
            projectId={detail.projectId}
            visible={this.state.selectUserVisible}
            type={this.state.type}
            selectDepartmentType={this.state.selectDepartmentType}
            onClose={() => {
              this.setState({
                selectUserVisible: false,
              });
            }}
            onSave={this.handleSave}
          />
        )}
        {this.state.transferAppVisible && (
          <SelectUser
            projectId={detail.projectId}
            visible={this.state.transferAppVisible}
            type="user"
            onlyOne={true}
            onClose={() => {
              this.setState({
                transferAppVisible: false,
              });
            }}
            onSave={users => {
              const { params } = this.props.match;
              this.props.dispatch(
                actions.transferApp({
                  appId: params.appId,
                  memberId: users[0].accountId,
                }),
              );
            }}
          />
        )}
        {selectJobVisible && (
          <SelectJob
            projectId={detail.projectId}
            visible={selectJobVisible}
            onClose={() => {
              this.setState({
                selectJobVisible: false,
              });
            }}
            onSave={this.handleSave}
          />
        )}
        {selectOrgnizedRoleVisible && (
          <SelectOrgRole
            projectId={detail.projectId}
            visible={selectOrgnizedRoleVisible}
            onClose={() => {
              this.setState({
                selectOrgnizedRoleVisible: false,
              });
            }}
            onSave={this.handleSave}
          />
        )}
      </Fragment>
    );
  };

  renderNull = (data = {}) => {
    const { detail } = this.props.memberList;
    let { isOwner, isAdmin } = getUserRole(detail.permissionType);
    isAdmin = isAdmin || isOwner;
    const canEditUser = data.canSetMembers || isAdmin;

    return (
      <div className="memberListWrapper h100">
        {this.renderBase()}
        <div className="flexRow alignItemsCenter TxtMiddle TxtCenter h100">
          <div className="flex flexColumn valignWrapper">
            <img src={noMmberImg} alt={_l('暂无成员')} width="110" />
            <br />
            <p className="mTop0 Gray_bd Font17">{_l('暂无成员')}</p>
            {canEditUser && !window.isPublicApp && (
              <Button
                className="addUserButton"
                color="primary"
                onClick={() => {
                  this.showActionSheet(data.roleId, data.userIds, data.roleType, data);
                }}
              >
                {_l('添加成员')}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  renderItem = data => {
    const { detail } = this.props.memberList;
    let { isOwner, isAdmin } = getUserRole(detail.permissionType);
    isAdmin = isAdmin || isOwner;
    const {
      users = [],
      departmentTreesInfos = [],
      departmentsInfos = [],
      projectOrganizeInfos = [],
      jobInfos = [],
    } = data;
    const canEditUser = data.canSetMembers || isAdmin;
    let list = [];
    list = list.concat(users.filter(it => it.isOwner));
    list = list.concat(jobInfos);
    list = list.concat(projectOrganizeInfos);
    list = list.concat(departmentsInfos);
    list = list.concat(departmentTreesInfos);
    list = list.concat(users.filter(it => !it.isOwner));
    list = list.sort((a, b) => b.isRoleCharger - a.isRoleCharger);

    return list.map(item => {
      const key = item.accountId || item.departmentId || item.departmentTreeId || item.projectOrganizeId || item.jobId;
      const name =
        item.fullName || item.departmentTreeName || item.departmentName || item.projectOrganizeName || item.jobName;
      const tag = item.departmentTreeId
        ? _l('部门')
        : item.departmentId
          ? _l('仅当前部门')
          : item.projectOrganizeId
            ? _l('组织角色')
            : item.jobId
              ? _l('职位')
              : '';
      const memberCategoryValue = item.accountId
        ? 5
        : item.departmentTreeId
          ? 1
          : item.departmentId
            ? 2
            : item.projectOrganizeId
              ? 3
              : item.jobId
                ? 4
                : 5;

      return (
        <List.Item
          key={key}
          className="listCon"
          arrow={canEditUser && (item.isOwner ? item.accountId === md.global.Account.accountId : true)}
          onClick={() => {
            canEditUser &&
              (item.isOwner ? item.accountId === md.global.Account.accountId : true) &&
              this.showActionUserSheet({
                ...item,
                ...data,
                canEditUser,
                memberCategory: (userStatusList.find(o => o.value === memberCategoryValue) || {}).key,
                memberId: key,
              });
          }}
        >
          <span className="Font16 Gray bold">{name}</span>
          {!item.accountId && <span className="tag Font14">{tag}</span>}
          {item.isRoleCharger && <Icon icon="people_5" className="Font14 mLeft10" style={{ color: '#FBBB44' }} />}
          {item.accountId && this.renderUserTag(data.roleType, item.isOwner)}
        </List.Item>
      );
    });
  };

  renderList = data => {
    // const { personalInfoVisible, accountId } = this.state;
    // const { params } = this.props.match;
    const { detail } = this.props.memberList;
    let { isOwner, isAdmin } = getUserRole(detail.permissionType);
    isAdmin = isAdmin || isOwner;

    return (
      <div className="memberListWrapper h100 pBottom44 flexColumn">
        {this.renderBase()}
        <List className="ListSection flex" style={{ overflow: 'auto' }}>
          {this.renderItem(data)}
        </List>
        {(data.canSetMembers || isAdmin) &&
          !(
            detail.permissionType === APP_ROLE_TYPE.RUNNER_ROLE && ['all', 'apply', 'outsourcing'].includes(data.roleId)
          ) && (
            <div
              className="TxtCenter addUser bold"
              onClick={() => this.showActionSheet(data.roleId, data.userIds, data.roleType, data)}
            >
              {_l('添加人员')}
            </div>
          )}
        {/* {personalInfoVisible && (
          <MobilePersonalInfo
            visible={personalInfoVisible}
            accountId={accountId}
            appId={params.appId}
            projectId={detail.projectId}
            onClose={this.closePersonalInfoPopup}
          />
        )} */}
      </div>
    );
  };

  render() {
    const { isListLoading } = this.props;
    if (isListLoading) {
      return (
        <div className="flexRow justifyContentCenter alignItemsCenter h100">
          <SpinLoading color="primary" />
        </div>
      );
    }
    const { params } = this.props.match;
    const data = _.find(this.props.memberList.list || [], item => item.roleId === params.roleId) || {};
    if (
      !data ||
      (!data.users && !data.departmentsInfos) ||
      data.users.length + data.departmentsInfos.length + data.departmentTreesInfos.length <= 0
    ) {
      return this.renderNull(data);
    } else {
      return this.renderList(data);
    }
  }
}

export default connect(state => {
  const { memberList, isListLoading, isUpdateListLoading, debugRoles } = state.mobile;
  return {
    memberList,
    isListLoading,
    isUpdateListLoading,
    debugRoles,
  };
})(MemberList);
