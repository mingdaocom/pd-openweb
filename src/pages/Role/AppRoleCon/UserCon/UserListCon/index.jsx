import React from 'react';
import { WrapTableCon } from 'src/pages/Role/style';
import _ from 'lodash';
import User from './User';
import Apply from './Apply';
import Outsourcing from './Outsourcing';
import { LoadDiv, Icon, Dialog } from 'ming-ui';
import { selectOrgRole } from 'src/components/DialogSelectOrgRole';
import AppAjax from 'src/api/appManagement';
import DialogSelectDept from 'src/components/dialogSelectDept';
import { selectJob } from 'src/components/DialogSelectJob';
import BatchDialog from 'src/pages/Role/AppRoleCon/component/BatchDialog';
import { getCurrentProject } from 'src/util';
import UserHead from 'src/components/userHead';
import { getIcon, getColor, getTxtColor, userStatusList } from 'src/pages/Role/AppRoleCon/UserCon/config';
import cx from 'classnames';
import { APP_ROLE_TYPE } from 'src/pages/worksheet/constants/enum.js';
import { sysRoleType } from 'src/pages/Role/config.js';

export default class UserListCon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userIds: [],
      isAll: false,
      show: false,
    };
  }
  formatPage = ({ isManager, canSetMembers }) => {
    const { appRole = {} } = this.props;
    const { roleInfos = [], roleId } = appRole;
    const isSys = [
      'all',
      'outsourcing',
      ...roleInfos.filter(o => sysRoleType.includes(o.roleType)).map(o => o.roleId),
    ].includes(roleId);
    if (isSys) {
      if (!isManager) {
        location.reload();
        return;
      }
    } else {
      if (!canSetMembers) {
        location.reload();
        return;
      }
    }
  };
  setData = () => {
    // 0:_l('全组织'),1:_l('部门树'),2: _l('部门'),3: _l('组织角色'), 4: _l('职位'),5 _l('成员'),
    const { userIds = [], isAll = false } = this.state;
    const { appRole = {} } = this.props;
    const { outsourcing = {}, userList = [] } = appRole;
    const { memberModels = [] } = outsourcing;
    let dataList = [...memberModels, ...userList];
    const getData = type => {
      return userIds
        .filter(item => {
          let data = dataList.find(o => {
            let ids = item.split('_');
            let id = ids[0];
            if (ids.length > 1) {
              return o.id === id && o.memberType === type && type + '' === ids[1];
            } else {
              return o.id === item && o.memberType === type;
            }
          });
          if (!!data) {
            return true;
          }
        })
        .map(o => o.split('_')[0]);
    };
    return {
      selectAll: isAll,
      organizationId: getData(0).length > 0 ? getData(0)[0] : '',
      userIds: getData(5),
      departmentTreeIds: getData(1),
      departmentIds: getData(2),
      organizeRoleIds: getData(3),
      jobIds: getData(4),
    };
  };
  /**
   * 添加职位
   */
  addJobToRole = () => {
    const { projectId = '', roleId } = this.props;
    selectJob({
      showCompanyName: false,
      projectId,
      isAppRole: true,
      overlayClosable: false,
      onSave: jobs => {
        this.addRoleMembers(roleId, { jobs });
      },
    });
  };

  /**
   * 添加部门
   */
  addDepartmentToRole = () => {
    const { projectId = '', appRole = {}, roleId, isExternal } = this.props;
    const { roleInfos = [] } = appRole;
    const roleInfo = roleInfos.find(o => o.roleId === roleId);
    new DialogSelectDept({
      projectId,
      selectedDepartment: [],
      unique: false,
      showCreateBtn: false,
      checkIncludeChilren: true, //选中是否包含子级
      allProject: isExternal
        ? true
        : !!projectId &&
          ![APP_ROLE_TYPE.ADMIN_ROLE, APP_ROLE_TYPE.DEVELOPERS_ROLE, APP_ROLE_TYPE.RUNNER_ROLE].includes(
            roleInfo.roleType, //管理员，开发者，运营者不能添加全组织
          ),
      selectFn: (departments, departmentTrees) => {
        this.addRoleMembers(roleId, {
          departments,
          departmentTrees,
        });
      },
    });
  };

  /**
   * 添加成员
   */
  addUserToRole = (accountIds = []) => {
    const { projectId, roleId } = this.props;
    import('src/components/dialogSelectUser/dialogSelectUser').then(dialogSelectUser => {
      dialogSelectUser.default({
        showMoreInvite: false,
        overlayClosable: false,
        SelectUserSettings: {
          projectId: _.isEmpty(getCurrentProject(projectId)) ? '' : projectId,
          filterAccountIds: accountIds,
          callback: users => {
            this.addRoleMembers(roleId, { users });
          },
        },
      });
    });
  };

  getExternalNormalRoleId = () => {
    const { appRole = {} } = this.props;
    const { roleInfos = [] } = appRole;
    return (roleInfos.filter(o => !sysRoleType.includes(o.roleType))[0] || {}).roleId;
  };

  /**
   * 添加成员提交
   */
  addRoleMembers = (roleId, { users = [], departments = [], jobs = [], departmentTrees = [], addOrgRoleList = [] }) => {
    const { projectId = '', appId = '', SetAppRolePagingModel, freshNum, isExternal } = this.props;
    AppAjax.addRoleMembers({
      projectId,
      appId,
      roleId: isExternal ? this.getExternalNormalRoleId() : roleId,
      userIds: _.map(users, ({ accountId }) => accountId),
      departmentIds: _.map(departments, ({ departmentId }) => departmentId),
      jobIds: _.map(jobs, ({ jobId }) => jobId),
      departmentTreeIds: _.map(departmentTrees, ({ departmentId }) => departmentId),
      projectOrganizeIds: _.map(addOrgRoleList, ({ organizeId }) => organizeId),
    }).then(res => {
      if (res) {
        alert(_l('添加成功'));
        SetAppRolePagingModel(null);
        freshNum();
      } else {
        alert(_l('操作失败，请刷新页面重试'), 2);
      }
    });
  };
  //退出应用
  delFromApp = () => {
    const { userIds = [], isAll = false } = this.state;
    const { appRole = {}, appId, setSelectedIds, freshNum } = this.props;
    const { outsourcing = {}, userList = [] } = appRole;
    const { memberModels = [] } = outsourcing;
    let data = [...memberModels, ...userList].find(o => o.id === userIds[0].split('_')[0]);
    Dialog.confirm({
      title:
        userIds.length > 1
          ? _l('你确认将%0个用户移出本应用吗？', userIds.length)
          : _l('你确认将“%0”移出本应用吗？', data.name),
      closable: false,
      anim: false,
      onOk: () => {
        let selectMember = this.setData();
        AppAjax.batchMemberQuitApp({
          appId,
          selectMember,
        }).then(res => {
          this.formatPage(res);
          setSelectedIds([]);
          freshNum();
        });
      },
    });
  };
  delFromRole = () => {
    const { userIds = [], isAll = false } = this.state;
    const { appRole = {}, appId = '', SetAppRolePagingModel, setSelectedIds, freshNum, roleId } = this.props;
    const { outsourcing = {}, userList = [] } = appRole;
    const { memberModels = [] } = outsourcing;
    let data = [...memberModels, ...userList].find(o => o.id === userIds[0].split('_')[0]);
    Dialog.confirm({
      title: userIds.length > 1 ? _l('你确认移出%0个用户吗？', userIds.length) : _l('你确认将“%0”移出吗？', data.name),
      closable: false,
      anim: false,
      onOk: () => {
        const {
          selectAll,
          organizationId,
          userIds: Ids,
          departmentTreeIds,
          departmentIds,
          jobIds,
          organizeRoleIds,
        } = this.setData();
        AppAjax.removeRoleMembers({
          selectAll,
          appId,
          roleId,
          projectId: organizationId,
          jobIds,
          userIds: Ids,
          departmentTreeIds,
          departmentIds: organizationId ? [`orgs_${organizationId}`, ...departmentIds] : departmentIds,
          projectOrganizeIds: organizeRoleIds,
        }).then(res => {
          this.formatPage(res);
          setSelectedIds([]);
          SetAppRolePagingModel(null);
          freshNum();
        });
      },
    });
  };

  formatUsers = userIds => {
    return userIds.map(o => o.split('_')[0]);
  };
  //批量编辑用户角色,添加角色
  editRole = (roleIds, cb) => {
    const { roleId, isExternal } = this.props;
    const { appRole = {}, setOutsourcingList, setUserList, setUser, getRoleSummary } = this.props;
    const { outsourcing = {}, userList = [], user = {}, roleInfos = [] } = appRole;
    let { userIds = [] } = this.state;
    if (roleIds.length <= 0) {
      return alert(_l('请选择角色'), 3);
    }
    const { appId = '', setSelectedIds } = this.props;
    // batchEditMemberRole; 批量编辑用户角色
    let roleName = roleInfos.filter(o => roleIds.includes(o.roleId)).map(o => o.name);
    AppAjax.batchEditMemberRole({
      appId,
      selectMember: _.omit(this.setData(), ['selectAll']),
      dstRoleIds: roleIds,
      selectAll: this.setData().selectAll,
      isOutsourcing: roleId === 'outsourcing',
    }).then(res => {
      this.formatPage(res);
      setSelectedIds([]);
      userIds = this.formatUsers(userIds);
      let data = {
        roleName: roleName,
        operater: md.global.Account.fullname,
      };
      //全部/外协 修改角色，数据更新优化
      if ('all' === roleId || isExternal) {
        setUserList(
          userList.map(o => {
            if (userIds.includes(o.id)) {
              return { ...o, ...data, isManager: isExternal ? !o.isManager : o.isManager };
            } else {
              return o;
            }
          }),
        );
        setUser({
          ...user,
          memberModels: user.memberModels.map(o => {
            if (userIds.includes(o.id)) {
              return { ...o, ...data, isManager: isExternal ? !o.isManager : o.isManager };
            } else {
              return o;
            }
          }),
        });
      } else {
        // outsourcing
        setOutsourcingList({
          ...outsourcing,
          memberModels: outsourcing.memberModels.map(o => {
            if (userIds.includes(o.id)) {
              return { ...o, ...data };
            } else {
              return o;
            }
          }),
        });
      }
      cb && cb();
      !isExternal && getRoleSummary(appId);
      this.setState({
        show: false,
        userIds: [],
      });
    });
  };

  // 移动到别的角色
  changeRole = roleIds => {
    const { appId = '', SetAppRolePagingModel, setSelectedIds, freshNum, roleId, appRole = {} } = this.props;
    const {
      selectAll,
      organizationId,
      userIds: Ids,
      departmentTreeIds,
      departmentIds,
      jobIds,
      organizeRoleIds,
    } = this.setData();
    AppAjax.removeUserToRole({
      selectAll,
      sourceAppRoleId: roleId,
      resultAppRoleIds: roleIds,
      appId,
      projectId: organizationId,
      jobIds,
      userIds: Ids,
      departmentTreeIds,
      departmentIds: organizationId ? [`orgs_${organizationId}`, ...departmentIds] : departmentIds,
      projectOrganizeIds: organizeRoleIds,
    }).then(res => {
      this.formatPage(res);
      const { roleInfos = [] } = appRole;
      if (
        roleId === (roleInfos.find(o => sysRoleType.includes(o.roleType)) || {}).roleId &&
        Ids.includes(md.global.Account.accountId)
      ) {
        location.reload();
      } else {
        setSelectedIds([]);
        SetAppRolePagingModel(null);
        freshNum();
        this.setState({
          show: false,
          userIds: [],
        });
      }
    });
  };

  renderCon = () => {
    const { roleId = 'all', loading, appRole = {}, projectId, freshNum, isExternal } = this.props;
    const { roleInfos = [] } = appRole;
    if (loading) {
      return <LoadDiv />;
    }
    switch (roleId) {
      case 'apply':
        return (
          <Apply
            {...this.props}
            placeholder={_l('搜索申请人')}
            title={_l('申请加入')}
            getAllInfoCount={() => {
              freshNum();
            }}
          />
        );
      case 'outsourcing':
        return (
          <Outsourcing
            {...this.props}
            placeholder={_l('搜索外协用户')}
            title={_l('外协用户')}
            delUserRole={(userIds, isAll = false) => {
              this.setState(
                {
                  userIds,
                  isAll,
                },
                () => {
                  this.delFromApp();
                },
              );
            }}
            changeUserRole={(userIds, isAll = false) => {
              this.setState({ show: true, userIds, isAll });
            }}
          />
        );
      default:
        return (
          <User
            {...this.props}
            roleId={roleId}
            placeholder={_l('搜索用户')}
            title={
              isExternal
                ? _l('管理用户')
                : roleId === 'all'
                ? _l('全部')
                : (roleInfos.find(o => o.roleId === roleId) || {}).name
            }
            // des={roleId === 'all' ? '' : (roleInfos.find(o => o.roleId === roleId) || {}).description}
            isMyRole={
              roleId === 'all'
                ? false
                : (roleInfos.find(o => o.roleId === roleId && !sysRoleType.includes(o.roleType)) || {}).isMyRole
            }
            addUserToRole={this.addUserToRole}
            addDepartmentToRole={this.addDepartmentToRole}
            addJobToRole={this.addJobToRole}
            addOrgRole={() => {
              selectOrgRole({
                projectId,
                showCompanyName: false,
                overlayClosable: false,
                onSave: data => {
                  let addOrgRoleList = data;
                  if (!_.isEmpty(addOrgRoleList)) {
                    this.addRoleMembers(roleId, { addOrgRoleList });
                  }
                },
              });
            }}
            delUserRole={(userIds, isAll = false) => {
              this.setState(
                {
                  userIds,
                  isAll,
                },
                () => {
                  if (roleId === 'all') {
                    this.delFromApp();
                  } else {
                    this.delFromRole();
                  }
                },
              );
            }}
            changeUserRole={(userIds, isAll = false) => {
              this.setState({ show: true, userIds, isAll });
            }}
            changeExternalManager={(dstRoleIds, userIds, isAll = false, cb) => {
              this.setState({ userIds, isAll }, () => {
                this.editRole(dstRoleIds, cb);
              });
            }}
          />
        );
    }
  };

  render() {
    const { show, userIds = [] } = this.state;
    const { roleId, appRole = {}, projectId, canEditUser, isExternal } = this.props;
    const { outsourcing = {}, userList = [], roleInfos = [] } = appRole;
    const { memberModels = [] } = outsourcing;
    return (
      <WrapTableCon className={cx('flex flexColumn Relative overflowHidden')}>
        {this.renderCon()}
        {show && (
          <BatchDialog
            show={show}
            renderCon={
              userIds.length === 1
                ? () => {
                    let data = [...memberModels, ...userList].find(o => o.id === userIds[0].split('_')[0]);
                    return (
                      <div className={cx('name flexRow alignItemsCenter')}>
                        {data.memberType === 5 ? (
                          <UserHead
                            key={data.accountId || data.id}
                            projectId={projectId}
                            size={40}
                            user={{
                              ...data,
                              accountId: data.accountId || data.id,
                              userHead: data.avatar,
                            }}
                            className={'roleAvatar'}
                          />
                        ) : (
                          <div
                            className={'iconBG flexRow alignItemsCenter TxtCenter'}
                            style={{ background: getColor(data) }}
                          >
                            <Icon icon={getIcon(data)} className={cx('Font24 flex', getTxtColor(data))} />
                          </div>
                        )}
                        <div className={'memberInfo flex pLeft5'}>
                          {data.isOwner ? (
                            <span className={'ownerTag'}>
                              <span className={'tag'}>{_l('拥有者')}</span>
                            </span>
                          ) : (
                            <React.Fragment>
                              <span className={'memberName'}>{data.name}</span>
                              <span className={'memberTag'}>
                                <span className={'tag'}>
                                  {[2].includes(data.memberType)
                                    ? _l('仅当前部门')
                                    : userStatusList.find(o => o.value === data.memberType).text}
                                </span>
                              </span>
                            </React.Fragment>
                          )}
                        </div>
                      </div>
                    );
                  }
                : null
            }
            txt={
              userIds.length <= 1
                ? null
                : roleId === 'all'
                ? _l('将修改选中的%0个用户', userIds.length)
                : _l('将选中的%0个用户移到其他角色', userIds.length)
            }
            title={roleId === 'all' ? _l('修改角色') : _l('移到其他角色')}
            roleInfos={roleInfos
              .filter(
                o =>
                  !sysRoleType.includes(o.roleType) &&
                  (!['all', 'apply', 'outsourcing'].includes(roleId) ? o.roleId !== roleId : true),
              )
              .filter(o => (canEditUser ? true : o.canSetMembers))} //角色负责人仅能操作自己有权限的角色
            okText={_l('保存')}
            onCancel={() => {
              this.setState({
                show: false,
                userIds: [],
              });
            }}
            isMulti={false}
            onOk={roleIds => {
              this.setState({
                show: false,
              });
              if (['all', 'outsourcing'].includes(roleId)) {
                this.editRole(roleIds);
              } else {
                this.changeRole(roleIds);
              }
            }}
          />
        )}
      </WrapTableCon>
    );
  }
}
