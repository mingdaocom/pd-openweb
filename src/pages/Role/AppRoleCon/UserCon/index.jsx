import React from 'react';
import cx from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from 'src/pages/Role/AppRoleCon/redux/actions';
import { WrapTableCon, WrapNav } from 'src/pages/Role/style';
import _ from 'lodash';
import DropOption from 'src/pages/Role/PortalCon/components/DropOption';
import styled from 'styled-components';
import User from './User';
import Apply from './Apply';
import Outsourcing from './Outsourcing';
import UserHead from 'src/pages/feed/components/userHead';
import BatchDialog from 'src/pages/Role/AppRoleCon/component/BatchDialog';
import { getCurrentProject } from 'src/util';
import { Dialog, Icon, LoadDiv, Tooltip } from 'ming-ui';
import DialogSelectDept from 'src/components/dialogSelectDept';
import DialogSelectJob from 'src/components/DialogSelectJob';
import DialogSelectOrgRole from 'src/components/DialogSelectOrgRole';
import AppAjax, {
  batchEditMemberRole,
  batchMemberQuitApp,
  removeRoleMembers,
  removeUserToRole,
} from 'src/api/appManagement';
import { getIcon, getColor, getTxtColor, userStatusList } from 'src/pages/Role/AppRoleCon/UserCon/config';
import SearchInput from 'src/pages/AppHomepage/AppCenter/components/SearchInput';
import { navigateTo } from 'src/router/navigateTo';
import DeleRoleDialog from 'src/pages/Role/AppRoleCon/component/DeleRoleDialog';

const WrapL = styled.div`
  .roleSearch {
    background: #fff;
    border-radius: 0;
    width: 100%;
    padding-left: 0;
  }
`;
const Wrap = styled.div`
  height: 100%;
  .navConList {
    overflow: auto !important;
  }
  .overflowHidden {
    overflow: hidden !important;
  }
  .hs {
    width: 6px;
    height: 6px;
    background: #f44336;
    border-radius: 50%;
    position: relative;
    top: -1px;
  }
  .isMyRole {
    width: 4px;
    height: 4px;
    background: #2196f3;
    border-radius: 50%;
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translate(0, -50%);
  }
  .optionNs {
    width: 20px;
    height: 20px;
    background: transparent;
    border-radius: 3px 3px 3px 3px;
    .moreop,
    .num {
      width: 20px;
      height: 20px;
      position: absolute;
      right: 0;
      top: 0;
      line-height: 20px;
      text-align: center;
    }
    .num {
      opacity: 1;
    }
    .moreop {
      opacity: 0;
    }
  }
  .navRoleLi {
    &:hover {
      .optionNs {
        .num {
          opacity: 0;
          z-index: 0;
        }
        .moreop {
          opacity: 1;
          z-index: 1;
        }
      }
    }
  }
  .iconBG {
    width: 32px;
    height: 32px;
    background: #2196f3;
    border-radius: 20px;
  }
  .memberInfo {
    .memberName {
      font-weight: 400;
    }
    .memberTag {
      font-size: 12px;
      color: #2196f3;
      padding: 2px 6px;
      border-radius: 12px;
      background: #f3faff;
      display: inline-block;
      flex-shrink: 0;
    }
    .ownerTag {
      color: #fff;
      background: #2196f3;
      font-weight: bold;
      padding: 2px 6px;
      font-size: 12px;
      border-radius: 12px;
      display: inline-block;
      flex-shrink: 0;
    }
  }
`;
const list = [
  {
    name: _l('全部'),
    roleId: 'all',
  },
  {
    name: _l('申请加入'),
    roleId: 'apply',
  },
  {
    name: _l('外协用户'),
    roleId: 'outsourcing',
  },
];
class Con extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      roleId: 'all',
      navList: list,
      show: false,
      userIds: [],
      isAll: false,
      orgRoleDialogVisible: false,
      keywords: '',
      roleList: [],
      showDeleRoleByMoveUser: false,
    };
  }
  componentDidMount() {
    const { setRoleId, isAdmin, appRole = {} } = this.props;
    const { roleInfos = [] } = appRole;
    const { quickTag } = appRole;
    if (!isAdmin) {
    } else {
      if (quickTag.roleId) {
        this.setState({
          roleId: quickTag.roleId,
        });
      } else {
        setRoleId('all');
      }
    }
    this.setState({
      roleList: roleInfos,
    });
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.appRole.pageLoading !== this.props.appRole.pageLoading ||
      nextProps.appRole.roleId !== this.props.appRole.roleId
    ) {
      this.setState(
        {
          roleId: nextProps.appRole.roleId,
        },
        () => {
          nextProps.setRoleId(nextProps.appRole.roleId);
        },
      );
    }
    if (nextProps.appRole.roleInfos !== this.props.appRole.roleInfos) {
      this.setState({
        roleList: nextProps.appRole.roleInfos,
      });
    }
  }

  delDialog = data => {
    if (data.totalCount > 0) {
      this.setState({ showDeleRoleByMoveUser: true, roleId: data.roleId });
    } else {
      return Dialog.confirm({
        title: <span className="Red">{_l('你确认删除此角色吗？')}</span>,
        buttonType: 'danger',
        description: '',
        onOk: () => {
          this.onRemoveRole(data);
        },
      });
    }
  };
  onRemoveRole = data => {
    const { appId, projectId, getRoleSummary, setRoleId } = this.props;
    const { resultRoleId = '' } = data;
    AppAjax.removeRole({
      appId,
      roleId: data.roleId,
      resultRoleId,
      projectId,
    }).then(res => {
      if (res) {
        let list = this.state.roleList.filter(o => o.roleId !== data.roleId);
        setRoleId('all');
        this.setState({
          showDeleRoleByMoveUser: false,
          roleId: 'all',
          roleList: list,
        });
        getRoleSummary(appId);
        alert(_l('删除成功'));
      } else {
        alert(_l('删除失败，请稍后重试'), 2);
      }
    });
  };

  renderNav = () => {
    const { setRoleId, appRole = {}, isAdmin, SetAppRolePagingModel, setSelectedIds, isOwner } = this.props;
    const { roleInfos = [], apply = [], outsourcing = {}, total } = appRole;
    const { navList, roleId, roleList = [], keywords } = this.state;
    return (
      <React.Fragment>
        <WrapL className="">
          {/* 非管理员无法操作，不能查看“申请加入”“设置”“全部”“外协用户” */}
          {isAdmin && (
            <div className="navCon bTBorder">
              <ul>
                {navList.map(o => {
                  return (
                    <li
                      className={cx('flexRow alignItemsCenter', { cur: roleId === o.roleId })}
                      onClick={() => {
                        this.setState({
                          roleId: o.roleId,
                        });
                        setRoleId(o.roleId);
                        SetAppRolePagingModel(null);
                        setSelectedIds([]);
                      }}
                    >
                      <span className="flex Font14">
                        {o.name}
                        {o.roleId === 'apply' && apply.length > 0 && <span className="hs mLeft2 InlineBlock"></span>}
                      </span>
                      <span className="num">
                        {o.roleId === 'all'
                          ? total || 0
                          : o.roleId === 'apply'
                          ? apply.length
                          : outsourcing.totalCount || 0}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          <div className="search mTop16">
            <SearchInput
              className="roleSearch"
              placeholder={_l('搜索角色')}
              value={keywords}
              onChange={keywords => {
                this.setState({
                  keywords,
                  roleList: roleInfos.filter(o => o.name.indexOf(keywords) >= 0),
                });
              }}
            />
          </div>
        </WrapL>
        <div className="navCon flex navConList">
          {roleList.length <= 0 ? (
            <div className="TxtCenter Gray_bd mTop20">{_l('无相关角色')}</div>
          ) : (
            <ul>
              {roleList.map(o => {
                let optList = [];
                let showOp =
                  ((o.isMyRole || isAdmin) && o.roleType !== 100) || //我的角色 和 有操作权限 （离开 编辑 删除）
                  (!isOwner && o.isMyRole && o.roleType === 100); //管理员角色 只有当前角色的 （离开）
                if (showOp) {
                  if (o.isMyRole && !(isOwner && o.roleType === 100)) {
                    optList = [
                      ...optList,
                      {
                        value: 0,
                        text: _l('离开'),
                      },
                    ];
                  }
                  if (isAdmin && o.roleType !== 100) {
                    optList = [
                      ...optList,
                      {
                        value: 1,
                        text: _l('编辑角色'),
                        showLine: o.isMyRole,
                      },
                      {
                        value: 2,
                        type: 'err',
                        text: _l('删除'),
                      },
                    ];
                  }
                }
                return (
                  <li
                    className={cx('flexRow alignItemsCenter navRoleLi', {
                      cur: roleId === o.roleId,
                      Relative: roleId !== o.roleId,
                    })}
                    onClick={() => {
                      this.setState({
                        roleId: o.roleId,
                      });
                      setRoleId(o.roleId);
                      SetAppRolePagingModel(null);
                      setSelectedIds([]);
                    }}
                  >
                    <span
                      className="flex flexRow alignItemsCenter TxtMiddle Font14 overflow_ellipsis breakAll InlineBlock"
                      title={o.name}
                    >
                      {roleId !== o.roleId && o.isMyRole && (
                        <span className="isMyRole mRight3 InlineBlock TxtMiddle"></span>
                      )}
                      {o.name}
                    </span>

                    {showOp ? (
                      <div className="optionNs Relative">
                        <DropOption
                          iconType={'more_horiz'}
                          dataList={optList}
                          showHeader={() => {
                            if (!o.isMyRole) {
                              return null;
                            }
                            return (
                              <div className="Gray_75 Font12" style={{ padding: '6px 16px' }}>
                                {_l('我所在的角色')}
                              </div>
                            );
                          }}
                          onAction={it => {
                            if (it.value === 0) {
                              Dialog.confirm({
                                title: <span className="Red">{_l('你确认离开此角色吗？')}</span>,
                                buttonType: 'danger',
                                description: _l('离开所有角色后你将不能访问此应用'),
                                onOk: () => {
                                  this.exitRole(o.roleId);
                                },
                              });
                            } else if (it.value === 1) {
                              this.props.setQuickTag({ roleId: o.roleId, tab: 'roleSet' });
                            } else if (it.value === 2) {
                              this.delDialog(this.state.roleList.find(it => it.roleId === o.roleId));
                            }
                          }}
                        />
                        {o.totalCount > 0 && <span className="num">{o.totalCount}</span>}
                      </div>
                    ) : (
                      o.totalCount > 0 && <span className="num">{o.totalCount}</span>
                    )}
                    {!!o.description && (
                      <Tooltip text={<span>{o.description}</span>} popupPlacement="top">
                        <i className="icon-info_outline Font16 Gray_9e mLeft7" />
                      </Tooltip>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </React.Fragment>
    );
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
  //退出应用
  delFromApp = () => {
    const { userIds = [], isAll = false } = this.state;
    const { appRole = {}, appId, setSelectedIds } = this.props;
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
        batchMemberQuitApp({
          appId,
          selectMember,
        }).then(res => {
          if (selectMember.userIds.includes(md.global.Account.accountId)) {
            navigateTo(`/app/${appId}`);
            location.reload();
          } else {
            setSelectedIds([]);
            this.freshNum();
          }
        });
      },
    });
  };
  //退出角色
  delFromRole = () => {
    const { userIds = [], isAll, roleId } = this.state;
    const { appRole = {}, appId = '', SetAppRolePagingModel, setSelectedIds } = this.props;
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
        removeRoleMembers({
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
          if (Ids.includes(md.global.Account.accountId)) {
            navigateTo(`/app/${appId}`);
            location.reload();
          } else {
            setSelectedIds([]);
            SetAppRolePagingModel(null);
            this.freshNum();
          }
        });
      },
    });
  };
  formatUsers = userIds => {
    return userIds.map(o => o.split('_')[0]);
  };
  //批量编辑用户角色,添加角色
  editRole = roleIds => {
    const { appRole = {}, setOutsourcingList, setUserList, setUser, getRoleSummary } = this.props;
    const { outsourcing = {}, userList = [], user = {}, roleInfos = [] } = appRole;
    let { userIds = [] } = this.state;
    if (roleIds.length <= 0) {
      return alert(_l('请选择角色', 3));
    }
    const {
      appId = '',
      SetAppRolePagingModel,

      setSelectedIds,
    } = this.props;
    // batchEditMemberRole; 批量编辑用户角色
    let roleName = roleInfos.filter(o => roleIds.includes(o.roleId)).map(o => o.name);
    batchEditMemberRole({
      appId,
      selectMember: _.omit(this.setData(), ['selectAll']),
      dstRoleIds: roleIds,
      selectAll: this.setData().selectAll,
      isOutsourcing: this.state.roleId === 'outsourcing',
    }).then(res => {
      setSelectedIds([]);
      userIds = this.formatUsers(userIds);
      //全部列表 修改当前用户为非管理员角色，需刷新页面
      if (userIds.includes(md.global.Account.accountId)) {
        location.reload();
        return;
      }
      //全部/外协 修改角色，数据更新优化
      if ('all' === this.state.roleId) {
        let data = {
          roleName: roleName,
          operater: md.global.Account.fullname,
        };
        setUserList(
          userList.map(o => {
            if (userIds.includes(o.id)) {
              return { ...o, ...data };
            } else {
              return o;
            }
          }),
        );
        setUser({
          ...user,
          memberModels: user.memberModels.map(o => {
            if (userIds.includes(o.id)) {
              return { ...o, ...data };
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
      getRoleSummary(appId);
      this.setState({
        show: false,
        userIds: [],
      });
    });
  };
  // 移动到别的角色
  changeRole = roleIds => {
    const {
      appId = '',
      SetAppRolePagingModel,

      setSelectedIds,
    } = this.props;
    const { roleId } = this.state;
    const {
      selectAll,
      organizationId,
      userIds: Ids,
      departmentTreeIds,
      departmentIds,
      jobIds,
      organizeRoleIds,
    } = this.setData();
    removeUserToRole({
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
      setSelectedIds([]);
      SetAppRolePagingModel(null);
      this.freshNum();
      this.setState({
        show: false,
        userIds: [],
      });
    });
  };
  /**
   * 添加职位
   */
  addJobToRole = () => {
    const { projectId = '' } = this.props;
    const { roleId } = this.state;
    new DialogSelectJob({
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
    const { projectId = '', appRole = {} } = this.props;
    const { roleId } = this.state;
    const { roleInfos = [] } = appRole;
    const roleInfo = roleInfos.find(o => o.roleId === roleId);
    new DialogSelectDept({
      projectId,
      selectedDepartment: [],
      unique: false,
      showCreateBtn: false,
      checkIncludeChilren: true, //选中是否包含子级
      allProject: !!projectId && ![100].includes(roleInfo.roleType),
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
    const { projectId } = this.props;
    const { roleId } = this.state;
    import('src/components/dialogSelectUser/dialogSelectUser').then(() => {
      $({}).dialogSelectUser({
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

  /**
   * 添加成员提交
   */
  addRoleMembers(roleId, { users = [], departments = [], jobs = [], departmentTrees = [], addOrgRoleList = [] }) {
    const { projectId = '', appId = '', SetAppRolePagingModel } = this.props;
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
        alert(_l('添加成功'));
        SetAppRolePagingModel(null);
        this.freshNum();
      } else {
        alert(_l('添加失败'), 2);
      }
    });
  }
  /**
   * 退出角色
   */
  exitRole = roleId => {
    const { appId = '', SetAppRolePagingModel } = this.props;
    return AppAjax.quitAppForRole({
      appId,
      roleId,
    }).then(res => {
      if (res.isRoleForUser) {
        if (res.isRoleDepartment) {
          if (this.state.roleList.filter(it => it.isMyRole).length <= 1) {
            navigateTo(`/app/${appId}`);
          }
          location.reload();
        } else {
          Dialog.confirm({
            title: <span style={{ color: '#f44336' }}>{_l('无法退出通过部门加入的角色')}</span>,
            description: _l('您所在的部门被加入了此角色，只能由应用管理员进行操作'),
            closable: false,
            removeCancelBtn: true,
            okText: _l('关闭'),
          });
          SetAppRolePagingModel(null);
          this.freshNum();
        }
      } else {
        alert(_l('退出失败'), 2);
      }
    });
  };

  freshNum = () => {
    const { appId = '', getUserList, getUserAllCount, fetchAllNavCount, isAdmin } = this.props;
    fetchAllNavCount({
      appId,
      isAdmin,
    });
    getUserList({ appId }, true);
    if (['all'].includes(this.state.roleId)) {
      // getUserList({ appId }, true);
    } else {
      getUserAllCount({ appId });
    }
  };

  renderCon = () => {
    const { roleId = 'all' } = this.state;
    const { appRole = {} } = this.props;
    const { roleInfos = [] } = appRole;
    switch (roleId) {
      case 'apply':
        return (
          <Apply
            {...this.props}
            placeholder={_l('搜索申请人')}
            title={_l('申请加入')}
            getAllInfoCount={() => {
              this.freshNum();
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
            title={roleId === 'all' ? _l('全部') : (roleInfos.find(o => o.roleId === roleId) || {}).name}
            // des={roleId === 'all' ? '' : (roleInfos.find(o => o.roleId === roleId) || {}).description}
            isMyRole={
              roleId === 'all'
                ? false
                : (roleInfos.find(o => o.roleId === roleId && ![100].includes(o.roleType)) || {}).isMyRole
            }
            addUserToRole={this.addUserToRole}
            addDepartmentToRole={this.addDepartmentToRole}
            addJobToRole={this.addJobToRole}
            addOrgRole={() => {
              this.setState({ orgRoleDialogVisible: true });
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
          />
        );
    }
  };

  render() {
    const { show, userIds, roleId, orgRoleDialogVisible } = this.state;
    const { appRole = {}, projectId } = this.props;
    const { outsourcing = {}, userList = [], roleInfos = [], pageLoading } = appRole;
    const { memberModels = [] } = outsourcing;
    if (pageLoading) {
      return <LoadDiv />;
    }
    return (
      <Wrap className="flexRow">
        <WrapNav className="flexColumn">{this.renderNav()}</WrapNav>
        <WrapTableCon className="flex overflowHidden flexColumn Relative">{this.renderCon()}</WrapTableCon>
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
                            key={data.accountId}
                            projectId={_.isEmpty(getCurrentProject(projectId)) ? '' : projectId}
                            size={40}
                            lazy="false"
                            user={{
                              ...data,
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
            roleInfos={roleInfos.filter(
              o =>
                ![100].includes(o.roleType) &&
                (!['all', 'apply', 'outsourcing'].includes(this.state.roleId) ? o.roleId !== this.state.roleId : true),
            )}
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
        {orgRoleDialogVisible && (
          <DialogSelectOrgRole
            showCompanyName={false}
            projectId={projectId}
            overlayClosable={false}
            orgRoleDialogVisible={orgRoleDialogVisible}
            onClose={() => {
              this.setState({ orgRoleDialogVisible: false });
            }}
            onSave={data => {
              let addOrgRoleList = data;
              if (!_.isEmpty(addOrgRoleList)) {
                this.addRoleMembers(roleId, { addOrgRoleList });
              }
            }}
          />
        )}
        {this.state.showDeleRoleByMoveUser && (
          <DeleRoleDialog
            roleList={this.state.roleList.filter(item => item.roleType !== 100 && item.roleId !== roleId)}
            onOk={data => {
              this.onRemoveRole({ ...this.state.roleList.find(o => o.roleId === roleId), resultRoleId: data });
            }}
            onCancel={() => {
              this.setState({
                showDeleRoleByMoveUser: false,
              });
            }}
          />
        )}
      </Wrap>
    );
  }
}

const mapStateToProps = state => ({
  appRole: state.appRole,
});
const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Con);
