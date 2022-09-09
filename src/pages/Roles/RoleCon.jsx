import React, { PureComponent } from 'react';
import { Icon, ScrollView, LoadDiv, Dialog, Tooltip } from 'ming-ui';
import cx from 'classnames';
import RoleSetting from './RoleSetting';
import AppAjax from 'src/api/appManagement';
import UserHead from 'src/pages/feed/components/userHead';
import { getIds } from '../PageHeader/util';
import { navigateTo } from 'router/navigateTo';
import Trigger from 'rc-trigger';
import { SortableContainer } from 'react-sortable-hoc';
import DialogSelectDept from 'dialogSelectDept';
import DialogSelectJob from 'src/components/DialogSelectJob';
import DialogSelectOrgRole from 'src/components/DialogSelectOrgRole';
import { isHaveCharge } from 'src/pages/worksheet/redux/actions/util';
import styles from './style.less?module';
import RoleItem from './RoleItem';
import ApplyDialog from './ApplyRoleDialog';
import { ROLE_TYPES, ROLE_CONFIG } from './config';
import { getCurrentProject } from 'src/util';

function RequestMap() {
  this.map = {};
}

RequestMap.prototype.add = function (name, request) {
  this.abort(name);
  this.map[name] = request;
  return request;
};

RequestMap.prototype.abort = function (name) {
  const request = this.map[name];
  if (request && request.state() === 'pending' && this.request.abort) {
    request.abort();
  }
};

RequestMap.prototype.abortAll = function () {
  _.forEach(this.map, request => {
    if (request && request.state() === 'pending' && request.abort) {
      request.abort();
    }
  });
};

const RoleList = SortableContainer(
  ({
    data,
    updateState,
    addJobToRole,
    addOrgRole,
    addDepartmentToRole,
    addUserToRole,
    removeUserFromRole,
    moveUserToRole,
    exitRole,
    deleteRole,
    transferApp,
    copyRole,
  }) => {
    const { roles, activeRoleId, rolesVisibleConfig, appDetail = {} } = data;
    const isAdmin = isHaveCharge(appDetail.permissionType, appDetail.isLock);
    const isOwner = appDetail.permissionType === ROLE_TYPES.OWNER;

    return (
      <div className={cx(styles.roleListWrapper, 'divCenter')}>
        {_.map(roles, (role, index) => (
          <RoleItem
            index={index}
            disabled={index === 0 || !isAdmin}
            key={role.roleId}
            projectId={appDetail.projectId}
            roles={_.filter(roles, ({ roleId }) => roleId !== role.roleId)}
            role={role}
            isOwner={isOwner}
            isAdmin={isAdmin}
            isUserAdmin={appDetail.permissionType >= 100}
            rolesVisibleConfig={rolesVisibleConfig}
            collapse={activeRoleId !== role.roleId}
            addJobToRole={() => {
              // 添加职位
              addJobToRole(role);
            }}
            addDepartmentToRole={() => {
              // 添加部门
              addDepartmentToRole(role);
            }}
            addOrgRole={() => {
              addOrgRole(role);
            }}
            addUserToRole={() => {
              // 添加成员
              addUserToRole(role);
            }}
            removeUserFromRole={(userIds, departmentIds, departmentTreeIds, jobIds, projectOrganizeIds) => {
              // 从角色中移除成员
              return removeUserFromRole(role.roleId, {
                userIds,
                departmentIds,
                departmentTreeIds,
                jobIds,
                projectOrganizeIds,
              });
            }}
            moveUser={(newRoleId, userIds, departmentIds, departmentTreeIds, jobIds, projectOrganizeIds) => {
              // 移动角色成员到另一个角色
              return moveUserToRole(role.roleId, newRoleId, {
                userIds,
                departmentIds,
                departmentTreeIds,
                jobIds,
                projectOrganizeIds,
              });
            }}
            exitRole={() => {
              // 退出角色
              return exitRole(role.roleId);
            }}
            deleteRole={transferRoleId => {
              // 删除角色
              return deleteRole(role.roleId, transferRoleId || '');
            }}
            onSelectRole={() => {
              // 选中角色成员
              updateState({
                show: true,
                roleId: role.roleId,
              });
            }}
            transferApp={transferApp}
            copyRole={() => copyRole(role)}
            onClickRole={() => {
              updateState({
                activeRoleId: activeRoleId !== role.roleId ? role.roleId : '',
              });
            }}
          />
        ))}
        {isAdmin && (
          <div
            className={cx(styles.roleItem, styles.createRole, 'Hand')}
            onClick={() => updateState({ show: true, roleId: null })}
          >
            <div className={styles.createBtn}>
              <Icon icon={'control_point'} className="Font24 mRight10 Gray_bd TxtMiddle" />
              <span className="TxtMiddle Gray_75 Font15">{_l('添加角色')}</span>
            </div>
            <div className={cx(styles.createDesc, 'Gray_9e')}>
              <div>{_l('添加角色为用户分发视图和权限，来控制用户可见的应用内容、数据和允许执行的操作')}</div>
            </div>
          </div>
        )}
      </div>
    );
  },
);

export default class RoleCon extends PureComponent {
  state = {
    applyList: undefined,
    // appDetail: undefined,
    roles: null,
    show: false,
    loading: false,
    showApplyDialog: false,
    activeRoleId: null,
    // 是否对非管理员隐藏角色详情
    rolesVisibleConfig: null,
    isOpenPortal: false, //是否开启外部门户
    editType: 0, //0:用户角色编辑 1:外部门户编辑
    showPortalSetting: false,
    showPortalRoleSetting: false,
    portalBaseSet: {},
    orgRoleDialogVisible: false,
    orgRoles: [],
  };

  componentDidMount() {
    const {
      match: {
        params: { editType },
      },
    } = this.props;
    this.setState({
      editType: Number(editType) || 0,
    });
    this.ids = getIds(this.props);
    this.fetch();
  }

  componentWillReceiveProps(nextProps) {
    this.ids = getIds(this.props);
    const {
      match: {
        params: { appId: currentAppId },
      },
    } = this.props;
    const {
      match: {
        params: { appId: nextAppId, editType },
      },
    } = nextProps;
    this.setState({
      editType: Number(editType) || 0,
    });
    if (currentAppId !== nextAppId) {
      this.setState({
        loading: true,
      });
      this.fetch(nextProps);
    }
  }

  componentWillUnmount() {
    this.requestMap.abortAll();
  }

  requestMap = new RequestMap();

  fetchApplyInfo() {
    const {
      match: {
        params: { appId },
      },
    } = this.props;

    const request = this.requestMap.add('applyList', AppAjax.getAppApplyInfo({ appId }));

    request.then(applyList => {
      this.setState({ applyList });
    });
  }
  fetchRoleConfig() {
    const {
      match: {
        params: { appId },
      },
    } = this.props;

    const request = this.requestMap.add('rolesVisibleConfig', AppAjax.getAppRoleSetting({ appId }));

    request.then(data => {
      this.setState({ rolesVisibleConfig: String(data.appSettingsEnum), notify: data.notify });
    });
  }

  fetch(props = this.props, withAppDetail = true) {
    const {
      match: {
        params: { appId },
      },
      appDetail,
    } = props;

    AppAjax.getRolesWithUsers({
      appId,
    })
      .then(roles => {
        this.setState({ roles });

        if (withAppDetail && isHaveCharge(appDetail.permissionType, appDetail.isLock)) {
          this.fetchApplyInfo();
          this.fetchRoleConfig();
        }
      })
      .always(() => {
        this.setState({
          loading: false,
        });
      });
  }

  reloadRoleList = () => {
    this.fetch(this.props, false);
  };

  reloadPortalRoleList = () => {
    const {
      match: {
        params: { appId },
      },
    } = this.props;
    this.props.getPortalRoleList(appId);
  };

  /**
   * 添加职位
   */
  addJobToRole = ({ roleId }) => {
    const { appDetail: { projectId = '' } = {} } = this.props;
    const { roles } = this.state;

    new DialogSelectJob({
      showCompanyName: false,
      projectId,
      isAppRole: true,
      onSave: jobs => {
        const jobIds = roles.filter(o => o.roleId === roleId)[0].jobInfos.map(item => item.jobId);
        jobs = jobs.filter(o => jobIds.indexOf(o.jobId) === -1);

        if (jobs.length) {
          this.addRoleMembers(roleId, { jobs });
        }
      },
    });
  };

  /**
   * 添加部门
   */
  addDepartmentToRole = ({ roleId, roleType }) => {
    const { appDetail: { projectId = '' } = {} } = this.props;
    const { roles = [] } = this.state;
    new DialogSelectDept({
      projectId,
      selectedDepartment: [],
      unique: false,
      showCreateBtn: false,
      checkIncludeChilren: true, //选中是否包含子级
      // includeProject: !!projectId && roleType !== ROLE_TYPES.ADMIN,
      allProject: !!projectId && roleType !== ROLE_TYPES.ADMIN,
      selectFn: (departments, departmentTrees) => {
        const depIds = roles.filter(o => o.roleId === roleId)[0].departmentsInfos.map(dept => dept.departmentId);
        const depTreeIds = (roles.filter(o => o.roleId === roleId)[0].departmentTreesInfos || []).map(
          dept => dept.departmentTreeId,
        );

        departments = departments.filter(o => depIds.indexOf(o.departmentId) === -1);
        departmentTrees = departmentTrees.filter(o => depTreeIds.indexOf(o.departmentId) === -1);

        if (departments.length || departmentTrees.length) {
          this.addRoleMembers(roleId, { departments, departmentTrees });
        }
      },
    });
  };

  /**
   * 添加组织角色
   */
  addOrgRole = ({ roleId }) => {
    this.setState({ orgRoleDialogVisible: true, currentRoleId: roleId });
  };

  /**
   * 添加成员
   */
  addUserToRole = ({ roleId, userIds }) => {
    const { appDetail: { projectId = '' } = {} } = this.props;

    import('dialogSelectUser').then(() => {
      $({}).dialogSelectUser({
        showMoreInvite: false,
        SelectUserSettings: {
          projectId: _.isEmpty(getCurrentProject(projectId)) ? '' : projectId,
          filterAccountIds: userIds,
          callback: users => {
            this.addRoleMembers(roleId, { users });
          },
        },
      });
    });
  };

  /**
   * 添加成员提交
   */
  addRoleMembers(roleId, { users = [], departments = [], jobs = [], departmentTrees = [], addOrgRoleList = [] }) {
    const { appDetail: { projectId = '', id: appId } = {} } = this.props;

    AppAjax.addRoleMembers({
      projectId,
      appId,
      roleId,
      userIds: _.map(users, ({ accountId }) => accountId),
      departmentIds: _.map(departments, ({ departmentId }) => departmentId),
      jobIds: _.map(jobs, ({ jobId }) => jobId),
      departmentTreeIds: _.map(departmentTrees, ({ departmentId }) => departmentId),
      projectOrganizeIds: _.map(addOrgRoleList, ({ organizeId }) => organizeId),
    }).then(res => {
      if (res) {
        this.setState(({ roles }) => {
          return {
            roles: _.map(roles, role => {
              if (role.roleId === roleId) {
                return {
                  ...role,
                  userIds: _.map(users, ({ accountId }) => accountId).concat(role.userIds),
                  users: role.users.concat(
                    _.map(users, ({ accountId, fullname, avatar }) => ({
                      accountId,
                      fullName: fullname,
                      avatar,
                    })),
                  ),
                  departmentsInfos: role.departmentsInfos.concat(
                    _.map(departments, ({ departmentId, departmentName }) => ({
                      departmentId,
                      departmentName,
                    })),
                  ),
                  departmentTreesInfos: (role.departmentTreesInfos || []).concat(
                    _.map(departmentTrees, ({ departmentId, departmentName }) => ({
                      departmentTreeId: departmentId,
                      departmentTreeName: departmentName,
                    })),
                  ),
                  jobInfos: role.jobInfos.concat(
                    _.map(jobs, ({ jobId, jobName }) => ({
                      jobId,
                      jobName,
                    })),
                  ),
                  projectOrganizeInfos: (role.projectOrganizeInfos || []).concat(
                    _.map(addOrgRoleList, ({ organizeId, organizeName }) => ({
                      projectOrganizeId: organizeId,
                      projectOrganizeName: organizeName,
                    })),
                  ),
                };
              }
              return role;
            }),
          };
        });
      } else {
        alert(_l('添加失败'), 2);
      }
    });
  }

  /**
   * 转交他人
   */
  transferApp = () => {
    const { appDetail: { projectId = '', id: appId } = {} } = this.props;
    import('dialogSelectUser').then(() => {
      $({}).dialogSelectUser({
        showMoreInvite: false,
        SelectUserSettings: {
          projectId,
          filterAll: true,
          filterFriend: true,
          filterOthers: true,
          filterOtherProject: true,
          unique: true,
          callback: users => {
            AppAjax.updateAppOwner({
              appId,
              memberId: users[0].accountId,
            }).then(res => {
              if (res) {
                this.reloadRoleList();
              } else {
                alert(_l('托付失败'), 2);
              }
            });
          },
        },
      });
    });
  };

  /**
   * 删除成员
   */
  removeUserFromRole = (
    roleId,
    { userIds = [], departmentIds = [], departmentTreeIds = [], jobIds = [], projectOrganizeIds = [] },
  ) => {
    const { appDetail: { projectId = '', id: appId } = {} } = this.props;
    return AppAjax.removeRoleMembers({
      projectId,
      appId,
      roleId,
      userIds,
      departmentIds,
      departmentTreeIds,
      jobIds,
      projectOrganizeIds,
    }).then(data => {
      if (data.result) {
        if (data.isManager) {
          this.reloadRoleList();
        } else {
          location.reload();
        }
      } else {
        alert(_l('移除失败'), 2);
      }
    });
  };

  /**
   * 退出角色
   */
  exitRole = roleId => {
    const { appDetail: { id: appId } = {} } = this.props;
    return AppAjax.quitAppForRole({
      appId,
      roleId,
    }).then(res => {
      if (res.isRoleForUser) {
        if (res.isRoleDepartment) {
          location.reload();
        } else {
          Dialog.confirm({
            title: <span style={{ color: '#f44336' }}>{_l('无法退出通过部门加入的角色')}</span>,
            description: _l('您所在的部门被加入了此角色，只能由应用管理员进行操作'),
            closable: false,
            removeCancelBtn: true,
            okText: _l('关闭'),
          });
          this.reloadRoleList();
        }
      } else {
        alert(_l('退出失败'), 2);
      }
    });
  };

  /**
   * 删除角色
   */
  deleteRole = (roleId, transferRoleId) => {
    const { appDetail: { projectId = '', id: appId } = {} } = this.props;
    return AppAjax.removeRole({ roleId, appId, projectId, resultRoleId: transferRoleId }).then(res => {
      if (res) {
        this.reloadRoleList();
      } else {
        alert(_l('删除失败'), 2);
      }
    });
  };

  /**
   * 移动到其他角色
   */
  moveUserToRole = (
    sourceAppRoleId,
    resultAppRoleId,
    { userIds = [], departmentIds = [], departmentTreeIds = [], jobIds = [], projectOrganizeIds },
  ) => {
    const { appDetail: { projectId = '', id: appId } = {} } = this.props;
    return AppAjax.removeUserToRole({
      projectId,
      appId,
      sourceAppRoleId,
      resultAppRoleId,
      userIds,
      departmentIds,
      departmentTreeIds,
      jobIds,
      projectOrganizeIds,
    }).then(res => {
      if (res) {
        this.reloadRoleList();
      } else {
        alert(_l('移动失败'), 2);
      }
    });
  };

  /**
   * 复制角色
   */
  copyRole = ({ roleId, name }) => {
    const { appDetail } = this.props;

    Dialog.confirm({
      title: _l('复制角色“%0”', name),
      description: _l('将复制目标角色的权限设置和描述。角色下的成员不会被复制'),
      okText: _l('复制'),
      onOk: () => {
        AppAjax.copyRole({
          appId: appDetail.id,
          roleId,
          roleName: name + _l('-复制'),
        }).then(res => {
          if (res) {
            this.reloadRoleList();
            this.setState({ activeRoleId: res });
          } else {
            alert(_l('复制失败'), 2);
          }
        });
      },
    });
  };

  renderApplyDialog() {
    const { showApplyDialog, roles, applyList } = this.state;

    if (showApplyDialog) {
      return (
        <ApplyDialog
          roles={roles}
          applyList={applyList}
          onCancel={() => {
            this.setState({ showApplyDialog: false });
            this.fetchApplyInfo();
            this.reloadRoleList();
          }}
        />
      );
    }
  }

  renderApplyList() {
    const { appDetail: { projectId = '' } = {} } = this.props;
    const { applyList } = this.state;

    if (applyList && applyList.length) {
      return (
        <div className={styles.applyListWrap}>
          <div
            className={cx(styles.applyList, 'Font13 Hand')}
            onClick={() => {
              this.setState({ showApplyDialog: true });
            }}
          >
            <div className={styles.roleMembers}>
              {_.map(applyList.slice(0, 6), ({ accountInfo: user }) => (
                <UserHead
                  key={user.accountId}
                  projectId={_.isEmpty(getCurrentProject(projectId)) ? '' : projectId}
                  size={24}
                  user={{
                    ...user,
                    userHead: user.avatar,
                  }}
                  className={styles.roleAvatar}
                />
              ))}
            </div>
            <span className={styles.applyText}>
              {_l('有')}
              <span className={styles.applyPersonCount}>{applyList.length}</span>
              {_l('人申请加入')}
            </span>
          </div>
        </div>
      );
    }
  }

  handleSwitchRolesDisplay = () => {
    const {
      match: {
        params: { appId },
      },
    } = this.props;
    const { rolesVisibleConfig } = this.state;
    const status = rolesVisibleConfig === ROLE_CONFIG.REFUSE ? ROLE_CONFIG.PERMISSION : ROLE_CONFIG.REFUSE;
    AppAjax.updateMemberStatus({ appId, status }).then(data => {
      if (data) {
        this.setState({ rolesVisibleConfig: status });
      }
    });
  };
  updateAppRoleNotify = () => {
    const {
      match: {
        params: { appId },
      },
    } = this.props;
    const { notify } = this.state;
    AppAjax.updateAppRoleNotify({ appId, notify: !notify }).then(data => {
      if (data) {
        this.setState({ notify: !notify });
      }
    });
  };

  onSortEnd = ({ oldIndex, newIndex }) => {
    const { appDetail: { id: appId } = {} } = this.props;
    const roles = this.state.roles.slice();
    const currentItem = roles.splice(oldIndex, 1)[0];

    roles.splice(newIndex, 0, currentItem);
    this.setState({ roles });

    AppAjax.sortRoles({
      appId,
      roleIds: roles.map(item => item.roleId),
    });
  };

  render() {
    const { appDetail = {} } = this.props;
    const { show, roleId, roles, rolesVisibleConfig, notify, loading, editType, orgRoleDialogVisible } = this.state;
    const { projectId = '' } = appDetail;
    const {
      match: {
        params: { appId },
      },
    } = this.props;
    const isAdmin = isHaveCharge(appDetail.permissionType, appDetail.isLock);
    return (
      <React.Fragment>
        <ScrollView>
          {this.renderApplyList()}
          <div className={styles.roleList}>
            {roles === null || loading ? (
              <LoadDiv className="mTop15" />
            ) : (
              <React.Fragment>
                <div className={styles.roleTop}>
                  <span className="Font14 Gray flex Bold">
                    {isAdmin ? _l('你是此应用的管理员，可以配置应用、角色和成员') : ''}
                  </span>
                  {isAdmin && editType === 0 && rolesVisibleConfig !== null && (
                    <React.Fragment>
                      <Tooltip
                        text={
                          <span>
                            {_l('开启时，当用户被添加、移除、变更角色时会收到系统通知，关闭时，以上操作不通知用户。')}
                          </span>
                        }
                        popupPlacement={'bottom'}
                      >
                        <div className={styles.roleDisplayConfig} onClick={this.updateAppRoleNotify}>
                          <span>{_l('发送通知')}</span>
                          <Icon
                            style={{ color: !notify ? '#bdbdbd' : '#43bd36' }}
                            className={cx('Font24 Hand')}
                            icon={!notify ? 'ic_toggle_off' : 'ic_toggle_on'}
                          />
                        </div>
                      </Tooltip>
                      <Tooltip
                        text={
                          <span>
                            {_l(
                              '开启时，普通用户（非管理员）可以查看应用下所有角色和人员。关闭后，普通用户将只能看到应用管理员。',
                            )}
                          </span>
                        }
                        popupPlacement={'bottom'}
                      >
                        <div className={styles.roleDisplayConfig} onClick={this.handleSwitchRolesDisplay}>
                          <span>{_l('允许查看')}</span>
                          <Icon
                            style={{ color: rolesVisibleConfig === ROLE_CONFIG.REFUSE ? '#bdbdbd' : '#43bd36' }}
                            className={cx('Font24 Hand')}
                            icon={rolesVisibleConfig === ROLE_CONFIG.REFUSE ? 'ic_toggle_off' : 'ic_toggle_on'}
                          />
                        </div>
                      </Tooltip>
                    </React.Fragment>
                  )}
                </div>
                <RoleList
                  onSortEnd={this.onSortEnd}
                  distance={5}
                  data={{ ...this.state, appDetail }}
                  updateState={obj => this.setState(obj)}
                  addJobToRole={this.addJobToRole}
                  addOrgRole={this.addOrgRole}
                  addDepartmentToRole={this.addDepartmentToRole}
                  addUserToRole={this.addUserToRole}
                  removeUserFromRole={this.removeUserFromRole}
                  moveUserToRole={this.moveUserToRole}
                  exitRole={this.exitRole}
                  deleteRole={this.deleteRole}
                  transferApp={this.transferApp}
                  copyRole={this.copyRole}
                />
              </React.Fragment>
            )}
          </div>
          {this.renderApplyDialog()}
        </ScrollView>
        {appDetail && roles && (
          <RoleSetting
            show={show}
            roleId={roleId}
            projectId={projectId}
            appId={appId}
            editCallback={this.reloadRoleList}
            closePanel={() => this.setState({ show: false })}
          />
        )}

        {orgRoleDialogVisible && (
          <DialogSelectOrgRole
            showCompanyName={false}
            projectId={projectId}
            orgRoleDialogVisible={orgRoleDialogVisible}
            onClose={() => {
              this.setState({ orgRoleDialogVisible: false, currentRoleId: '' });
            }}
            onSave={data => {
              const { appDetail: { projectId = '' } = {} } = this.props;
              const { roles, currentRoleId } = this.state;
              const projectOrganizeIds = roles
                .filter(o => o.roleId === currentRoleId)[0]
                .projectOrganizeInfos.map(item => item.projectOrganizeId);
              let addOrgRoleList = data.filter(o => projectOrganizeIds.indexOf(o.organizeId) === -1);
              if (!_.isEmpty(addOrgRoleList)) {
                this.addRoleMembers(currentRoleId, { addOrgRoleList });
              }
            }}
          />
        )}
      </React.Fragment>
    );
  }
}
