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
              // ????????????
              addJobToRole(role);
            }}
            addDepartmentToRole={() => {
              // ????????????
              addDepartmentToRole(role);
            }}
            addUserToRole={() => {
              // ????????????
              addUserToRole(role);
            }}
            removeUserFromRole={(userIds, departmentIds, jobIds) => {
              // ????????????????????????
              return removeUserFromRole(role.roleId, { userIds, departmentIds, jobIds });
            }}
            moveUser={(newRoleId, userIds, departmentIds, jobIds) => {
              // ????????????????????????????????????
              return moveUserToRole(role.roleId, newRoleId, { userIds, departmentIds, jobIds });
            }}
            exitRole={() => {
              // ????????????
              return exitRole(role.roleId);
            }}
            deleteRole={transferRoleId => {
              // ????????????
              return deleteRole(role.roleId, transferRoleId || '');
            }}
            onSelectRole={() => {
              // ??????????????????
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
              <span className="TxtMiddle Gray_75 Font15">{_l('????????????')}</span>
            </div>
            <div className={cx(styles.createDesc, 'Gray_9e')}>
              <div>{_l('??????????????????????????????????????????????????????????????????????????????????????????????????????????????????')}</div>
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
    // ???????????????????????????????????????
    rolesVisibleConfig: null,
    isOpenPortal: false, //????????????????????????
    editType: 0, //0:?????????????????? 1:??????????????????
    showPortalSetting: false,
    showPortalRoleSetting: false,
    portalBaseSet: {},
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

    const request = this.requestMap.add('rolesVisibleConfig', AppAjax.getMemberStatus({ appId }));

    request.then(rolesVisibleConfig => {
      this.setState({ rolesVisibleConfig: String(rolesVisibleConfig) });
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
   * ????????????
   */
  addJobToRole = ({ roleId }) => {
    const { appDetail: { projectId = '' } = {} } = this.props;
    const { roles } = this.state;

    new DialogSelectJob({
      projectId,
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
   * ????????????
   */
  addDepartmentToRole = ({ roleId, roleType }) => {
    const { appDetail: { projectId = '' } = {} } = this.props;
    const { roles = [] } = this.state;
    new DialogSelectDept({
      projectId,
      selectedDepartment: [],
      unique: false,
      showCreateBtn: false,
      allProject: !!projectId && roleType !== ROLE_TYPES.ADMIN,
      selectFn: departments => {
        const depIds = roles.filter(o => o.roleId === roleId)[0].departmentsInfos.map(dept => dept.departmentId);

        departments = departments.filter(o => depIds.indexOf(o.departmentId) === -1);

        if (departments.length) {
          this.addRoleMembers(roleId, { departments });
        }
      },
    });
  };

  /**
   * ????????????
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
   * ??????????????????
   */
  addRoleMembers(roleId, { users = [], departments = [], jobs = [] }) {
    const { appDetail: { projectId = '', id: appId } = {} } = this.props;

    AppAjax.addRoleMembers({
      projectId,
      appId,
      roleId,
      userIds: _.map(users, ({ accountId }) => accountId),
      departmentIds: _.map(departments, ({ departmentId }) => departmentId),
      jobIds: _.map(jobs, ({ jobId }) => jobId),
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
                  jobInfos: role.jobInfos.concat(
                    _.map(jobs, ({ jobId, jobName }) => ({
                      jobId,
                      jobName,
                    })),
                  ),
                };
              }
              return role;
            }),
          };
        });
      } else {
        alert(_l('????????????'), 2);
      }
    });
  }

  /**
   * ????????????
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
                alert(_l('????????????'), 2);
              }
            });
          },
        },
      });
    });
  };

  /**
   * ????????????
   */
  removeUserFromRole = (roleId, { userIds = [], departmentIds = [], jobIds = [] }) => {
    const { appDetail: { projectId = '', id: appId } = {} } = this.props;
    return AppAjax.removeRoleMembers({
      projectId,
      appId,
      roleId,
      userIds,
      departmentIds,
      jobIds,
    }).then(data => {
      if (data.result) {
        if (data.isManager) {
          this.reloadRoleList();
        } else {
          location.reload();
        }
      } else {
        alert(_l('????????????'), 2);
      }
    });
  };

  /**
   * ????????????
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
            title: <span style={{ color: '#f44336' }}>{_l('???????????????????????????????????????')}</span>,
            description: _l('??????????????????????????????????????????????????????????????????????????????'),
            closable: false,
            removeCancelBtn: true,
            okText: _l('??????'),
          });
          this.reloadRoleList();
        }
      } else {
        alert(_l('????????????'), 2);
      }
    });
  };

  /**
   * ????????????
   */
  deleteRole = (roleId, transferRoleId) => {
    const { appDetail: { projectId = '', id: appId } = {} } = this.props;
    return AppAjax.removeRole({ roleId, appId, projectId, resultRoleId: transferRoleId }).then(res => {
      if (res) {
        this.reloadRoleList();
      } else {
        alert(_l('????????????'), 2);
      }
    });
  };

  /**
   * ?????????????????????
   */
  moveUserToRole = (sourceAppRoleId, resultAppRoleId, { userIds = [], departmentIds = [], jobIds = [] }) => {
    const { appDetail: { projectId = '', id: appId } = {} } = this.props;
    return AppAjax.removeUserToRole({
      projectId,
      appId,
      sourceAppRoleId,
      resultAppRoleId,
      userIds,
      departmentIds,
      jobIds,
    }).then(res => {
      if (res) {
        this.reloadRoleList();
      } else {
        alert(_l('????????????'), 2);
      }
    });
  };

  /**
   * ????????????
   */
  copyRole = ({ roleId, name }) => {
    const { appDetail } = this.props;

    Dialog.confirm({
      title: _l('???????????????%0???', name),
      description: _l('?????????????????????????????????????????????????????????????????????????????????'),
      okText: _l('??????'),
      onOk: () => {
        AppAjax.copyRole({
          appId: appDetail.id,
          roleId,
          roleName: name + _l('-??????'),
        }).then(res => {
          if (res) {
            this.reloadRoleList();
            this.setState({ activeRoleId: res });
          } else {
            alert(_l('????????????'), 2);
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
              {_l('???')}
              <span className={styles.applyPersonCount}>{applyList.length}</span>
              {_l('???????????????')}
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
    const { show, roleId, roles, rolesVisibleConfig, loading, editType } = this.state;
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
                    {isAdmin ? _l('??????????????????????????????????????????????????????????????????') : ''}
                  </span>
                  {isAdmin && editType === 0 && rolesVisibleConfig !== null && (
                    <Tooltip
                      text={
                        <span>
                          {_l(
                            '????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????',
                          )}
                        </span>
                      }
                      popupPlacement={'bottomRight'}
                    >
                      <div className={styles.roleDisplayConfig} onClick={this.handleSwitchRolesDisplay}>
                        <span>{_l('????????????????????????')}</span>
                        <Icon
                          style={{ color: rolesVisibleConfig === ROLE_CONFIG.REFUSE ? '#bdbdbd' : '#43bd36' }}
                          className={cx('Font24 Hand')}
                          icon={rolesVisibleConfig === ROLE_CONFIG.REFUSE ? 'ic_toggle_off' : 'ic_toggle_on'}
                        />
                      </div>
                    </Tooltip>
                  )}
                </div>
                <RoleList
                  onSortEnd={this.onSortEnd}
                  distance={5}
                  data={{ ...this.state, appDetail }}
                  updateState={obj => this.setState(obj)}
                  addJobToRole={this.addJobToRole}
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
      </React.Fragment>
    );
  }
}
