import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import * as actions from './redux/actions';
import cx from 'classnames';
import {
  WingBlank,
  WhiteSpace,
  Card,
  List,
  Flex,
  ActionSheet,
  Modal,
  ActivityIndicator,
  Button,
  Switch,
} from 'antd-mobile';
import { Icon, Dialog } from 'ming-ui';
import DialogSelectDept from 'src/components/dialogSelectDept';
import { ROLE_TYPES, ROLE_CONFIG } from 'src/pages/Role/config.js';
import noMmberImg from '../img/noMember.png';
import Back from '../../components/Back';
import SelectUser from '../../components/SelectUser';
import SelectJob from '../../components/SelectJob';
import SelectOrgRole from '../../components/SelectOrgRole';
import './index.less';
import '../index.less';

const isIPhone = new RegExp('\\biPhone\\b|\\biPod\\b', 'i').test(window.navigator.userAgent);
let wrapProps;
if (isIPhone) {
  wrapProps = {
    onTouchStart: e => e.preventDefault(),
  };
}
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
    ActionSheet.close();
  }

  showActionSheet = (roleId, userIds, roleType, data) => {
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
    ActionSheet.showActionSheetWithOptions(
      {
        options: BUTTONS.map(item => (
          <Fragment>
            <Icon className={cx('mRight15 Gray_9e', item.iconClass)} icon={item.icon} />
            <span className="Bold">{item.name}</span>
          </Fragment>
        )),
        maskClosable: true,
        'data-seed': 'logId',
        message: (
          <div className="flexRow header">
            <span className="Font13">{_l('人员管理')}</span>
            <div
              className="closeIcon"
              onClick={() => {
                ActionSheet.close();
              }}
            >
              <Icon icon="close" />
            </div>
          </div>
        ),
        wrapProps,
      },
      buttonIndex => {
        if (buttonIndex === -1) return;
        if (buttonIndex === 0) {
          this.setState({
            type: 'user',
            selectUserVisible: true,
          });
        }
        if (buttonIndex === 1 && detail.projectId) {
          this.showActionDepartment();
        }
        if (buttonIndex === 2 && detail.projectId) {
          this.setState({ selectJobVisible: true, type: 'job' });
        }
        if (buttonIndex === 3 && detail.projectId) {
          this.setState({ selectOrgnizedRoleVisible: true, type: 'orgnizeRole' });
        }
      },
    );
  };
  showActionDepartment = (roleId, userIds, roleType, data) => {
    const BUTTONS = [
      { name: _l('仅选择当前部门'), selectValue: 'current' },
      { name: _l('选择当前部门下所有子部门'), selectValue: 'all' },
    ];
    ActionSheet.showActionSheetWithOptions(
      {
        options: BUTTONS.map(item => (
          <Fragment>
            <span className="Bold">{item.name}</span>
          </Fragment>
        )),
        maskClosable: true,
        'data-seed': 'logId',
        message: (
          <div className="flexRow header">
            <span className="Font13">
              <Icon
                icon="arrow_back"
                className="mRight10"
                onClick={() => {
                  ActionSheet.close();
                  this.showActionSheet();
                }}
              />
              {_l('添加部门')}
            </span>
            <div
              className="closeIcon"
              onClick={() => {
                ActionSheet.close();
                this.showActionSheet();
              }}
            >
              <Icon icon="close" />
            </div>
          </div>
        ),
        wrapProps,
      },
      buttonIndex => {
        if (buttonIndex === -1) return;
        this.setState({
          type: 'department',
          selectUserVisible: true,
          selectDepartmentType: buttonIndex === 0 ? 'current' : 'all',
        });
      },
    );
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
  }) => {
    const { detail } = this.props.memberList;
    const { params } = this.props.match;
    const changeRole = { name: _l('更换角色'), icon: 'refresh', iconClass: 'Gray_9e Font18' };
    const exit = { name: _l('退出'), icon: 'exit_to_app2', iconClass: 'Font20' };
    const BUTTONS_Owers = [{ name: _l('将应用托付给他人'), icon: 'forward2', iconClass: 'Gray_9e' }];
    const BUTTONS_Admins_Other = [changeRole, { name: _l('移除'), icon: 'task-new-delete', iconClass: 'Font18' }];
    const BUTTONS_Admins_Me = [changeRole, exit];
    const BUTTONS_Members = [exit];
    let BUTTONS = '';
    // 管理员
    const isAdmin = detail.permissionType === ROLE_TYPES.ADMIN;
    // 拥有者
    const isOwer = detail.permissionType === ROLE_TYPES.OWNER;
    // 成员
    const isMember = detail.permissionType === ROLE_TYPES.MEMBER;
    // 当前用户本人
    const isMe = accountId === md.global.Account.accountId;
    if (isAdmin) {
      // 管理员=》对自己_l('更换角色'), _l('退出')/其他_l('更换角色'), _l('移除')
      BUTTONS = isMe ? BUTTONS_Admins_Me : BUTTONS_Admins_Other;
    } else if (isOwer) {
      // 拥有者  对自己=》将应用托付给他人/对他人_l('更换角色'), _l('移除')
      BUTTONS = isMe ? BUTTONS_Owers : BUTTONS_Admins_Other;
    } else if (isMember) {
      // 成员=》退出
      BUTTONS = BUTTONS_Members;
    } else {
      BUTTONS = BUTTONS_Members;
    }
    ActionSheet.showActionSheetWithOptions(
      {
        options: BUTTONS.map(item => (
          <Fragment>
            <Icon className={cx('mRight10', item.iconClass)} icon={item.icon} />
            <span className="Bold">{item.name}</span>
          </Fragment>
        )),
        destructiveButtonIndex: isOwer && isMe ? null : BUTTONS.length - 1,
        maskClosable: true,
        'data-seed': 'logId',
        message: (
          <div className="flexRow header">
            <span className="Font13">{_l('人员管理')}</span>
            <div
              className="closeIcon"
              onClick={() => {
                ActionSheet.close();
              }}
            >
              <Icon icon="close" />
            </div>
          </div>
        ),
        wrapProps,
      },
      buttonIndex => {
        if (buttonIndex === -1) return;
        if (buttonIndex === 0 && (isAdmin || (accountId != md.global.Account.accountId && isOwer))) {
          // 更换角色
          this.props.history.push(
            `/mobile/changeRole/${!detail.projectId ? 'individual' : detail.projectId}/${params.appId}/${
              params.roleId
            }/${accountId}/${departmentId}/${departmentTreeId}/${projectOrganizeId}/${jobId}`,
          );
        } else if (buttonIndex === 0 && isMe && isOwer) {
          // 将应用托付给他人
          this.setState({
            transferAppVisible: true,
          });
        } else if (
          (buttonIndex === 0 && isMember) ||
          (buttonIndex === 1 && isMe && isAdmin) ||
          (buttonIndex === 0 && isMe)
        ) {
          // 退出
          modal = Modal.alert(_l('确认退出此角色吗 ?'), '', [
            {
              text: _l('取消'),
              style: { color: '#2196F3' },
              onPress: () => {},
            },
            {
              text: _l('退出'),
              style: { color: 'red' },
              onPress: () => {
                this.props.dispatch(
                  actions.exitRole({
                    roleId: params.roleId,
                    appId: params.appId,
                    callback: () => {
                      this.props.history.push(`/mobile/appHome`);
                    },
                  }),
                );
              },
            },
          ]);
        } else if (buttonIndex === 1 && !isMe && (isAdmin || isOwer)) {
          // 移除
          modal = Modal.alert(_l('是否移除该成员？'), '', [
            {
              text: _l('取消'),
              style: { color: '#2196F3' },
              onPress: () => {},
            },
            {
              text: _l('移除'),
              style: { color: 'red' },
              onPress: () => {
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
            },
          ]);
        }
      },
    );
  };

  isCanDo = item => {
    const { detail } = this.props.memberList;
    if (detail.permissionType === ROLE_TYPES.OWNER) {
      // 拥有者可操作所有
      return true;
    } else {
      if (detail.permissionType === ROLE_TYPES.ADMIN) {
        // 管理员非拥有者，不可操作拥有者departmentId
        return !item.isOwner;
      } else if (item.accountId === md.global.Account.accountId) {
        // 普通成员只能操作自己
        return true;
      } else {
        return false;
      }
    }
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
    const { detail } = this.props.memberList;
    const { selectJobVisible, selectOrgnizedRoleVisible } = this.state;
    return (
      <Fragment>
        <Back
          className="low"
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

  renderNull = data => {
    const { detail } = this.props.memberList;
    const isAdmin = detail.permissionType === ROLE_TYPES.OWNER || detail.permissionType === ROLE_TYPES.ADMIN;
    return (
      <div className="memberListWrapper h100">
        {this.renderBase()}
        <Flex align="center" justify="between" className="TxtMiddle TxtCenter h100">
          <Flex.Item className="flexColumn valignWrapper">
            <img src={noMmberImg} alt={_l('暂无成员')} width="110" />
            <br />
            <p className="mTop0 Gray_bd Font17">{_l('暂无成员')}</p>
            {isAdmin && (
              <Button
                className="addUserButton"
                type="primary"
                onClick={() => {
                  this.showActionSheet(data.roleId, data.userIds, data.roleType, data);
                }}
              >
                {_l('添加成员')}
              </Button>
            )}
          </Flex.Item>
        </Flex>
      </div>
    );
  };

  renderList = data => {
    const { detail } = this.props.memberList;
    const text =
      data.description || (data.permissionWay === 80 ? _l('可以配置应用，管理应用下所有数据和人员') : _l('自定义权限'));
    const isAdmin = detail.permissionType === ROLE_TYPES.OWNER || detail.permissionType === ROLE_TYPES.ADMIN;
    const isOwner = detail.permissionType === ROLE_TYPES.OWNER;
    return (
      <div className="memberListWrapper h100">
        {this.renderBase()}
        <List className="ListSection">
          {data.users
            .filter(it => it.isOwner)
            .map(item => (
              <List.Item
                key={item.accountId}
                className="listCon"
                arrow={this.isCanDo(item) ? 'horizontal' : 'empty'}
                onClick={() => {
                  this.isCanDo(item) &&
                    this.showActionUserSheet({ accountId: item.accountId, departmentId: item.departmentId });
                }}
              >
                <span className="Font16 Gray bold">{item.fullName}</span>
                {this.renderUserTag(data.roleType, item.isOwner)}
              </List.Item>
            ))}

          {data.departmentTreesInfos.map((item, i) => (
            <List.Item
              key={item.departmentTreeId}
              className="listCon"
              arrow={this.isCanDo(item) ? 'horizontal' : 'empty'}
              onClick={() => {
                this.isCanDo(item) &&
                  this.showActionUserSheet({ accountId: item.accountId, departmentTreeId: item.departmentTreeId });
              }}
            >
              <span className="Font16 Gray bold">{item.departmentTreeName}</span>
              <span className="tag Font14">{_l('部门')}</span>
            </List.Item>
          ))}
          {data.departmentsInfos.map((item, i) => (
            <List.Item
              key={item.departmentId}
              className="listCon"
              arrow={this.isCanDo(item) ? 'horizontal' : 'empty'}
              onClick={() => {
                this.isCanDo(item) &&
                  this.showActionUserSheet({ accountId: item.accountId, departmentId: item.departmentId });
              }}
            >
              <span className="Font16 Gray bold">{item.departmentName}</span>
              <span className="tag Font14">{_l('仅当前部门')}</span>
            </List.Item>
          ))}

          {data.projectOrganizeInfos.map(item => (
            <List.Item
              key={item.projectOrganizeId}
              className="listCon"
              arrow={this.isCanDo(item) ? 'horizontal' : 'empty'}
              onClick={() => {
                this.isCanDo(item) && this.showActionUserSheet({ projectOrganizeId: item.projectOrganizeId });
              }}
            >
              <span className="Font16 Gray bold">{item.projectOrganizeName}</span>
              <span className="tag Font14">{_l('组织角色')}</span>
            </List.Item>
          ))}
          {data.jobInfos.map(item => (
            <List.Item
              key={item.jobId}
              className="listCon"
              arrow={this.isCanDo(item) ? 'horizontal' : 'empty'}
              onClick={() => {
                this.isCanDo(item) && this.showActionUserSheet({ jobId: item.jobId });
              }}
            >
              <span className="Font16 Gray bold">{item.jobName}</span>
              <span className="tag Font14">{_l('职位')}</span>
            </List.Item>
          ))}

          {data.users
            .filter(it => !it.isOwner)
            .map((item, i) => (
              <List.Item
                key={item.accountId}
                className="listCon"
                arrow={this.isCanDo(item) ? 'horizontal' : 'empty'}
                onClick={() => {
                  this.isCanDo(item) &&
                    this.showActionUserSheet({ accountId: item.accountId, departmentId: item.departmentId });
                }}
              >
                <span className="Font16 Gray bold">{item.fullName}</span>
                {this.renderUserTag(data.roleType, item.isOwner)}
              </List.Item>
            ))}
        </List>
        {isAdmin && (
          <List.Item
            className="mTop30"
            onClick={() => {
              this.showActionSheet(data.roleId, data.userIds, data.roleType, data);
            }}
          >
            <div className="TxtCenter addUser bold">{_l('添加人员')}</div>
          </List.Item>
        )}
      </div>
    );
  };

  render() {
    const { isListLoading } = this.props;
    if (isListLoading) {
      return (
        <Flex justify="center" align="center" className="h100">
          <ActivityIndicator size="large" />
        </Flex>
      );
    }
    const { params } = this.props.match;
    const data = this.props.memberList.list.filter(item => item.roleId === params.roleId)[0];
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
  const { memberList, isListLoading, isUpdateListLoading } = state.mobile;
  return {
    memberList,
    isListLoading,
    isUpdateListLoading,
  };
})(MemberList);
