import React, { Component, Fragment } from 'react';
import './index.less';
import cx from 'classnames';
import { Dropdown, UserHead } from 'ming-ui';
import { USER_TYPE, USER_ORGANIZE, DEPARTMENT_ORGANIZE } from '../../../enum';
import Tag from '../Tag';
import _ from 'lodash';
import { handleGlobalVariableName } from '../../../utils';
import { dialogSelectOrgRole, dialogSelectJob } from 'ming-ui/functions';
import { Tooltip } from 'antd';

export default class Member extends Component {
  /**
   * 删除成员
   */
  removeMember = index => {
    const accounts = _.cloneDeep(this.props.accounts);

    _.remove(accounts, (obj, i) => i === index);
    this.props.updateSource({ accounts });
  };

  /**
   * render普通成员
   */
  renderUser(item) {
    const { chatButton = true, companyId } = this.props;

    return (
      <div className="flexRow flowDetailMemberBox">
        <UserHead
          projectId={companyId}
          user={{
            userHead: item.avatar,
            accountId: item.roleId,
          }}
          size={26}
          chatButton={chatButton}
        />
        <div className="mLeft6 ellipsis bold">{item.roleName}</div>
      </div>
    );
  }

  /**
   * render角色
   */
  renderRole(item) {
    const { appId } = this.props;

    return (
      <div className="flexRow flowDetailMemberBox">
        <span className={cx('flowDetailMemberIcon icon-group-members bd')} />

        <div className={cx('mLeft6 ellipsis bold', { delete: !item.roleName && !item.entityName })}>
          {!item.roleName && !item.entityName
            ? _l('角色已删除')
            : item.roleName + (appId !== item.entityId ? `（${item.entityName}）` : '')}
        </div>
      </div>
    );
  }

  /**
   * render字段
   */
  renderControl(item, index) {
    const { removeOrganization } = this.props;
    const list = [
      [
        { text: USER_ORGANIZE[11], value: 11 },
        { text: item.controlType !== 27 ? USER_ORGANIZE[12] : DEPARTMENT_ORGANIZE[12], value: 12 },
        { text: item.controlType !== 27 ? USER_ORGANIZE[13] : DEPARTMENT_ORGANIZE[13], value: 13 },
        { text: item.controlType !== 27 ? USER_ORGANIZE[14] : DEPARTMENT_ORGANIZE[14], value: 14 },
        {
          text: (
            <span>
              {item.controlType !== 27 ? USER_ORGANIZE[15] : DEPARTMENT_ORGANIZE[15]}
              {this.renderOrgRoleInfo()}
            </span>
          ),
          value: 15,
        },
      ],
      [{ text: _l('移除'), value: 0 }],
    ];

    if (!item.roleTypeId) {
      _.remove(list, (o, i) => i === 1);
    }

    // 部门控件
    if (item.controlType === 27) {
      list.forEach(arr => {
        _.remove(arr, o => o.value === 11);
      });
    }

    return (
      <Fragment>
        <Tag
          flowNodeType={item.flowNodeType}
          appType={item.appType}
          actionId={item.actionId}
          nodeName={handleGlobalVariableName(item.entityId, item.sourceType, item.entityName)}
          controlId={item.roleId}
          controlName={item.roleName}
        />
        {(item.controlType === 26 ||
          item.controlType === 27 ||
          item.controlType === 10000001 ||
          item.controlType === 10000002) &&
          !!item.entityName &&
          !!item.roleName &&
          !removeOrganization && (
            <Fragment>
              <Dropdown
                className={cx('flowDetailOrganize', { organizeTransform: item.roleTypeId })}
                data={list}
                value={item.roleTypeId}
                isAppendToBody
                menuStyle={{ width: 'auto !important' }}
                border
                renderTitle={() => this.renderOrganize(item.controlType, item.roleTypeId)}
                onChange={roleTypeId => this.onChange(roleTypeId, index)}
              />
              {_.includes([14, 15], item.roleTypeId) && this.renderExtensionInfo(item, index)}
            </Fragment>
          )}
      </Fragment>
    );
  }

  /**
   * render组织结构
   */
  renderOrganize(controlType, roleTypeId) {
    if (!roleTypeId) {
      return (
        <span data-tip={controlType !== 27 ? _l('使用人员的组织结构关系') : _l('使用部门的组织结构关系')}>
          <i className="icon-task-point-more flowDetailMemberOrganize" />
        </span>
      );
    }

    return (
      <div
        className={cx(
          'flowDetailMemberOrganizeTitle',
          { user: roleTypeId === 11 },
          { department: _.includes([12, 13], roleTypeId) },
          { job: roleTypeId === 14 },
          { role: roleTypeId === 15 },
        )}
      >
        {controlType !== 27 ? USER_ORGANIZE[roleTypeId] : DEPARTMENT_ORGANIZE[roleTypeId]}
        <i className="icon-arrow-down-border mLeft5" />
      </div>
    );
  }

  /**
   * 更改组织结构
   */
  onChange(roleTypeId, index) {
    const accounts = _.cloneDeep(this.props.accounts);

    if (roleTypeId === 14) {
      this.selectJob(index);
    }

    if (roleTypeId === 15) {
      this.selectOrgRole(index);
    }

    accounts[index].roleTypeId = roleTypeId;
    this.props.updateSource({ accounts });
  }

  /**
   * 渲染额外扩展信息
   */
  renderExtensionInfo(item, index) {
    const roleExtension = {
      14: {
        placeholder: _l('选择职位'),
        delText: _l('职位已删除'),
        action: this.selectJob,
      },
      15: {
        placeholder: _l('选择组织角色'),
        delText: _l('组织角色已删除'),
        action: this.selectOrgRole,
      },
    };

    return (
      <div
        className={cx(
          'flowDetailMemberJob bold',
          { ThemeColor3: !item.extensionId },
          { delete: item.extensionId && !item.extensionName },
        )}
        onClick={() => roleExtension[item.roleTypeId].action(index)}
      >
        {item.extensionId
          ? item.extensionName || roleExtension[item.roleTypeId].delText
          : roleExtension[item.roleTypeId].placeholder}
        <i className="icon-arrow-down-border mLeft5 Gray" />
      </div>
    );
  }

  /**
   * 选择职位
   */
  selectJob = index => {
    const { companyId } = this.props;

    dialogSelectJob({
      projectId: companyId,
      overlayClosable: false,
      unique: true,
      onSave: jobs => {
        const accounts = _.cloneDeep(this.props.accounts);

        accounts[index].extensionId = jobs[0].jobId;
        accounts[index].extensionName = jobs[0].jobName;

        this.props.updateSource({ accounts });
      },
    });
  };

  /**
   * 选择组织角色
   */
  selectOrgRole = index => {
    const { companyId } = this.props;

    dialogSelectOrgRole({
      projectId: companyId,
      unique: true,
      onSave: roles => {
        const accounts = _.cloneDeep(this.props.accounts);

        accounts[index].extensionId = roles[0].organizeId;
        accounts[index].extensionName = roles[0].organizeName;

        this.props.updateSource({ accounts });
      },
    });
  };

  /**
   * 渲染文本
   */
  renderText(item) {
    return (
      <div className="flexRow flowDetailMemberBox">
        <div className="pLeft12 ellipsis">{item.entityId}</div>
      </div>
    );
  }

  /**
   * 渲染标签
   */
  renderTags(item) {
    return (
      <div className="flexRow flowDetailMemberBox">
        <span
          className={cx(
            'flowDetailMemberIcon',
            item.type === USER_TYPE.DEPARTMENT
              ? 'icon-department blue'
              : item.type === USER_TYPE.ROLE
              ? 'icon-limit-principal bd'
              : 'icon-user bd',
          )}
        />

        <div className="mLeft6 ellipsis bold">{item.entityName}</div>
      </div>
    );
  }

  /**
   * 渲染部门
   */
  renderDepartment(item, index) {
    const { removeOrganization } = this.props;
    const list = [
      [
        { text: DEPARTMENT_ORGANIZE[12], value: 12 },
        { text: DEPARTMENT_ORGANIZE[13], value: 13 },
        { text: DEPARTMENT_ORGANIZE[14], value: 14 },
        {
          text: (
            <span>
              {DEPARTMENT_ORGANIZE[15]}
              {this.renderOrgRoleInfo()}
            </span>
          ),
          value: 15,
        },
      ],
      [{ text: _l('移除'), value: 0 }],
    ];

    if (!item.roleTypeId) {
      _.remove(list, (o, i) => i === 1);
    }

    return (
      <Fragment>
        {this.renderTags(item)}
        {!!item.entityName && !removeOrganization && (
          <Fragment>
            <Dropdown
              className={cx('flowDetailOrganize', { organizeTransform: item.roleTypeId })}
              data={list}
              value={item.roleTypeId || ''}
              isAppendToBody
              menuStyle={{ width: 'auto !important' }}
              border
              renderTitle={() => this.renderOrganize(27, item.roleTypeId)}
              onChange={roleTypeId => this.onChange(roleTypeId, index)}
            />
            {_.includes([14, 15], item.roleTypeId) && this.renderExtensionInfo(item, index)}
          </Fragment>
        )}
      </Fragment>
    );
  }

  /**
   * 渲染组织角色描述
   */
  renderOrgRoleInfo() {
    return (
      <Tooltip
        zIndex={10000}
        placement="bottom"
        title={_l(
          '由所选组织角色中设置的分管此部门的负责人进行审批。如：工会委员（组织角色）中张三分管部门A、B；则A、B部门的审批由张三作为负责人。',
        )}
      >
        <i className="icon-info Font16 mLeft10" />
      </Tooltip>
    );
  }

  render() {
    const { accounts, leastOne, inline } = this.props;
    const nullText = {
      [USER_TYPE.ROLE]: _l('角色下未设置人员'),
      [USER_TYPE.DEPARTMENT]: _l('部门下未设置人员'),
      [USER_TYPE.JOB]: _l('职位下未设置人员'),
      [USER_TYPE.ORGANIZE_ROLE]: _l('组织角色下未设置人员'),
    };

    return (
      <ul className="flowDetailMembers">
        {(accounts || []).map((item, i) => {
          return (
            <li
              key={i}
              className={cx(inline ? 'inlineFlexRow' : 'flexRow', {
                noDel: leastOne && accounts.length <= 1,
              })}
              style={{ zIndex: accounts.length - i }}
            >
              {item.type === USER_TYPE.USER && this.renderUser(item)}
              {item.type === USER_TYPE.ROLE && this.renderRole(item)}
              {item.type === USER_TYPE.CONTROL && this.renderControl(item, i)}
              {item.type === USER_TYPE.TEXT && this.renderText(item)}
              {item.type === USER_TYPE.DEPARTMENT && this.renderDepartment(item, i)}
              {_.includes([USER_TYPE.JOB, USER_TYPE.ORGANIZE_ROLE], item.type) && this.renderTags(item)}

              {!(leastOne && accounts.length <= 1) && (
                <span className="mLeft5 flowDetailMemberDel" data-tip={_l('刪除')} onClick={() => this.removeMember(i)}>
                  <i className={cx('icon-delete', inline ? 'Font14' : 'Font18')} />
                </span>
              )}
              {!inline &&
                _.includes([USER_TYPE.ROLE, USER_TYPE.DEPARTMENT, USER_TYPE.JOB, USER_TYPE.ORGANIZE_ROLE], item.type) &&
                !item.count && (
                  <div className="flowDetailMemberError flex">
                    <i className="mRight5 Font16 icon-workflow_error" />
                    {nullText[item.type]}
                  </div>
                )}
              {!inline && _.includes([USER_TYPE.ROLE], item.type) && item.count === -1 && (
                <div className="flowDetailMemberError flex">
                  <i className="mRight5 Font16 icon-workflow_error" />
                  {_l('不支持包含全组织的角色')}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  }
}
