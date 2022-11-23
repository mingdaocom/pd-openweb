import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import './index.less';
import 'src/components/dialogSelectUser/dialogSelectUser';
import DialogSelectDept from 'src/components/dialogSelectDept';
import { MenuItem } from 'ming-ui';
import ActionFields from '../ActionFields';
import SelectUsersFromApp from '../../../../components/SelectUsersFromApp';
import { USER_TYPE, CONTROLS_NAME } from '../../../enum';
import flowNode from '../../../../api/flowNode';
import DialogSelectJob from 'src/components/DialogSelectJob';
import DialogSelectOrgRole from 'src/components/DialogSelectOrgRole';

export default class SelectUserDropDown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showSelectAppUserDialog: false,
      fieldsData: [],
      showSelectRoleDialog: false,
    };
  }

  componentWillReceiveProps(nextProps, nextState) {
    if (nextProps.nodeId !== this.props.nodeId) {
      this.setState({ fieldsData: [] });
    }

    if (nextProps.visible && !this.state.fieldsData.length && !this.props.disabledNodeRole) {
      this.getUserAppDtos(nextProps);
    }
  }

  /**
   * 获取节点人员数据
   */
  getUserAppDtos(props) {
    const { processId, nodeId, specialType, schedule } = props;
    flowNode.getUserAppDtos({ processId, nodeId, type: specialType, schedule }).then(result => {
      const fieldsData = result.map(obj => {
        return {
          ...obj,
          text: obj.nodeName,
          id: obj.nodeId,
          nodeTypeId: obj.nodeTypeId,
          appType: obj.appType,
          actionId: obj.actionId,
          items: obj.controls.map(o => {
            return {
              type: o.type,
              value: o.controlId,
              field: CONTROLS_NAME[o.type],
              text: o.controlName,
            };
          }),
        };
      });

      this.setState({ fieldsData });
    });
  }

  /**
   * 头部
   */
  header() {
    const { specialType, disabledNodeRole, onlyNodeRole, from } = this.props;

    return (
      <ul className="flowDetailUserList">
        {onlyNodeRole ? null : (
          <Fragment>
            {(specialType === 3 || specialType === 5) && (
              <div className="explainHeader flexRow">
                <i className={cx('Gray_9e', specialType === 3 ? 'icon-download_client' : 'icon-mailbox')} />
                <input
                  type="text"
                  className="w100"
                  autoFocus
                  placeholder={specialType === 3 ? _l('输入手机号码') : _l('输入邮箱地址')}
                  onClick={evt => evt.stopPropagation()}
                  onKeyDown={this.addTelAndEmail}
                />
              </div>
            )}
            <MenuItem icon={<i className="icon-account_circle" />} onClick={this.addMembers}>
              {_l('通讯录')}
            </MenuItem>
            <React.Fragment>
              <MenuItem icon={<i className="icon-department" />} onClick={this.addDepartment}>
                {_l('部门')}
              </MenuItem>
              <MenuItem
                icon={<i className="icon-user" />}
                onClick={() => this.setState({ showSelectRoleDialog: true })}
              >
                {_l('组织角色')}
              </MenuItem>
              <MenuItem icon={<i className="icon-limit-principal" />} onClick={this.addJob}>
                {_l('职位')}
              </MenuItem>
              <MenuItem
                icon={<i className="icon-group-members" />}
                onClick={() => this.setState({ showSelectAppUserDialog: true })}
              >
                {_l('应用角色')}
              </MenuItem>
            </React.Fragment>
          </Fragment>
        )}

        {!disabledNodeRole && (
          <div className={cx('explainText', { explainTextClearStyle: onlyNodeRole })}>
            <i className="icon-workflow_new Gray_9e" />
            {_l('使用流程节点对象下的人员')}
          </div>
        )}
      </ul>
    );
  }

  /**
   * 添加手机号码和邮箱地址
   */
  addTelAndEmail = evt => {
    const { unique, updateSource, specialType } = this.props;
    const txt = evt.currentTarget.value.trim();
    const accounts = _.cloneDeep(this.props.accounts);
    const reg = specialType === 3 ? /^1[3456789]\d{9}$/ : /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)*\.[\w-]+$/i;
    const members = [];

    if (evt.keyCode === 13) {
      if (reg.test(txt)) {
        if (!_.find(accounts, obj => obj.type === USER_TYPE.TEXT && obj.entityId === txt)) {
          members.push({
            type: USER_TYPE.TEXT,
            entityId: txt,
            entityName: '',
            roleId: '',
            roleName: '',
            avatar: '',
          });

          updateSource({ accounts: unique ? members : accounts.concat(members) });
        }
        evt.currentTarget.value = '';
      } else {
        alert(specialType === 3 ? _l('输入的手机号码有误') : _l('输入的邮箱地址有误'), 2);
      }
    }

    evt.stopPropagation();
  };

  /**
   * 添加普通成员
   */
  addMembers = evt => {
    const accounts = _.cloneDeep(this.props.accounts);
    const { companyId, unique, updateSource, onClose } = this.props;

    evt.stopPropagation();
    onClose();

    $(evt.target).dialogSelectUser({
      title: _l('选择人员'),
      showMoreInvite: false,
      SelectUserSettings: {
        filterAccountIds: accounts.map(item => item.roleId),
        projectId: companyId,
        dataRange: 2,
        unique,
        callback: users => {
          const members = users.map(item => {
            return {
              type: USER_TYPE.USER,
              entityId: '',
              entityName: '',
              roleId: item.accountId,
              roleName: item.fullname,
              avatar: item.avatar,
            };
          });

          updateSource({ accounts: unique ? members : accounts.concat(members) });
        },
      },
    });
  };

  /**
   * 添加部门
   */
  addDepartment = evt => {
    const accounts = _.cloneDeep(this.props.accounts);
    const { companyId, unique, updateSource, onClose } = this.props;

    evt.stopPropagation();
    onClose();

    new DialogSelectDept({
      projectId: companyId,
      returnCount: true,
      selectedDepartment: [],
      unique: unique,
      showCreateBtn: false,
      selectFn: departments => {
        const ids = accounts.map(dept => dept.entityId);

        departments = departments
          .filter(o => ids.indexOf(o.departmentId) === -1)
          .map(o => {
            return {
              type: USER_TYPE.DEPARTMENT,
              entityId: o.departmentId,
              entityName: o.departmentName,
              roleId: '',
              roleName: '',
              avatar: '',
              count: o.userCount,
            };
          });

        if (departments.length) {
          updateSource({ accounts: unique ? departments : accounts.concat(departments) });
        }
      },
    });
  };

  /**
   * 添加职位
   */
  addJob = evt => {
    const accounts = _.cloneDeep(this.props.accounts);
    const { companyId, unique, updateSource, onClose } = this.props;

    evt.stopPropagation();
    onClose();

    new DialogSelectJob({
      projectId: companyId,
      unique,
      onSave: jobs => {
        const ids = accounts.map(dept => dept.entityId);

        jobs = jobs
          .filter(o => ids.indexOf(o.jobId) === -1)
          .map(o => {
            return {
              type: USER_TYPE.JOB,
              entityId: o.jobId,
              entityName: o.jobName,
              roleId: '',
              roleName: '',
              avatar: '',
              count: o.userCount,
            };
          });

        if (jobs.length) {
          updateSource({ accounts: unique ? jobs : accounts.concat(jobs) });
        }
      },
    });
  };

  /**
   * 选择应用包下的角色返回值
   */
  selectAppUsers = ({ appId, appName, roles }) => {
    const accounts = _.cloneDeep(this.props.accounts);
    const { unique, updateSource, onClose } = this.props;
    const members = [];

    roles.forEach(item => {
      if (!_.find(accounts, obj => obj.entityId === appId && obj.roleId === item.roleId)) {
        members.push({
          type: USER_TYPE.ROLE,
          entityId: appId,
          entityName: appName,
          roleId: item.roleId,
          roleName: item.roleName,
          avatar: '',
          count: item.count,
        });
      }
    });

    onClose();
    updateSource({ accounts: unique ? members : accounts.concat(members) });
    this.setState({ showSelectAppUserDialog: false });
  };

  /**
   * 添加组织角色
   */
  selectRole = roles => {
    const accounts = _.cloneDeep(this.props.accounts);
    const { unique, updateSource, onClose } = this.props;
    const ids = accounts.map(dept => dept.entityId);

    roles = roles
      .filter(o => ids.indexOf(o.organizeId) === -1)
      .map(o => {
        return {
          type: USER_TYPE.ORGANIZE_ROLE,
          entityId: o.organizeId,
          entityName: o.organizeName,
          roleId: '',
          roleName: '',
          avatar: '',
        };
      });

    onClose();
    updateSource({ accounts: unique ? roles : accounts.concat(roles) });
    this.setState({ showSelectRoleDialog: false });
  };

  /**
   * 节点人员选择
   */
  handleFieldClick = ({
    nodeId,
    fieldValueId,
    nodeName,
    fieldValueName,
    fieldValueType,
    nodeTypeId,
    appType,
    actionId,
  }) => {
    const accounts = _.cloneDeep(this.props.accounts);
    const { unique, updateSource, onClose } = this.props;
    const members = [];

    members.push({
      type: USER_TYPE.CONTROL,
      entityId: nodeId,
      entityName: nodeName,
      roleId: fieldValueId,
      roleTypeId: 0,
      roleName: fieldValueName,
      avatar: '',
      controlType: fieldValueType,
      flowNodeType: nodeTypeId,
      appType,
      actionId,
    });

    onClose();
    updateSource({ accounts: unique ? members : accounts.concat(members) });
  };

  render() {
    const { visible, appId, companyId, onClose, unique } = this.props;
    const { fieldsData, showSelectAppUserDialog, showSelectRoleDialog } = this.state;

    if (!visible) {
      return null;
    }

    // 应用包角色选择
    if (showSelectAppUserDialog) {
      return (
        <SelectUsersFromApp
          appId={appId}
          multiChoose={!unique}
          companyId={companyId}
          onOk={this.selectAppUsers}
          onCancel={() => {
            onClose();
            this.setState({ showSelectAppUserDialog: false });
          }}
        />
      );
    }

    // 选择组织角色
    if (showSelectRoleDialog) {
      return (
        <DialogSelectOrgRole
          projectId={companyId}
          orgRoleDialogVisible
          unique={unique}
          onSave={this.selectRole}
          onClose={() => {
            onClose();
            this.setState({ showSelectRoleDialog: false, visibleRoleDialog: false });
          }}
        />
      );
    }

    return (
      <ActionFields
        header={this.header()}
        className="actionFields"
        noItemTips={_l('没有可用的字段')}
        condition={fieldsData}
        handleFieldClick={this.handleFieldClick}
        onClickAwayExceptions={['.workflowDetailAddBtn']}
        onClose={onClose}
      />
    );
  }
}
