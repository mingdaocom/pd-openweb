import React, { Component, Fragment } from 'react';
import './index.less';
import cx from 'classnames';
import { Dropdown } from 'ming-ui';
import UserHead from 'src/pages/feed/components/userHead';
import { USER_TYPE, NODE_TYPE, USER_ORGANIZE, DEPARTMENT_ORGANIZE } from '../../../enum';
import Tag from '../Tag';

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
    return (
      <div className="flexRow flowDetailMemberBox">
        <UserHead
          user={{
            userHead: item.avatar,
            accountId: item.roleId,
          }}
          lazy={'false'}
          size={26}
        />
        <div className="mLeft10 ellipsis bold">{item.roleName}</div>
      </div>
    );
  }

  /**
   * render角色
   */
  renderRole(item) {
    const { type } = this.props;

    return (
      <div className="flexRow flowDetailMemberBox">
        <span
          className={cx(
            'flowDetailMemberIcon icon-invite_members',
            { violet: type === NODE_TYPE.APPROVAL },
            { green: type === NODE_TYPE.NOTICE },
            { skyBlue: type === NODE_TYPE.WRITE },
            { blue: type === NODE_TYPE.MESSAGE || type === NODE_TYPE.EMAIL },
          )}
        />

        <div className="mLeft10 ellipsis bold">{`${item.roleName}（${item.entityName}）`}</div>
      </div>
    );
  }

  /**
   * render字段
   */
  renderControl(item, index) {
    const list = [
      [
        { text: USER_ORGANIZE[11], value: 11 },
        { text: item.controlType !== 27 ? USER_ORGANIZE[12] : DEPARTMENT_ORGANIZE[12], value: 12 },
        { text: item.controlType !== 27 ? USER_ORGANIZE[13] : DEPARTMENT_ORGANIZE[13], value: 13 },
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
          nodeName={item.entityName}
          controlName={item.roleName}
        />
        {(item.controlType === 26 ||
          item.controlType === 27 ||
          item.controlType === 10000001 ||
          item.controlType === 10000002) &&
          !!item.entityName &&
          !!item.roleName && (
            <Dropdown
              className={cx('flowDetailOrganize', { organizeTransform: item.roleTypeId })}
              data={list}
              value={item.roleTypeId}
              border
              renderTitle={() => this.renderOrganize(item.controlType, item.roleTypeId)}
              onChange={roleTypeId => this.onChange(roleTypeId, index)}
            />
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
      <div className="flowDetailMemberOrganizeTitle">
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

    accounts[index].roleTypeId = roleTypeId;
    this.props.updateSource({ accounts });
  }

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
   * 渲染部门 或 职位
   */
  renderDepartmentOrJob(item) {
    const { type } = this.props;

    return (
      <div className="flexRow flowDetailMemberBox">
        <span
          className={cx(
            'flowDetailMemberIcon',
            item.type === USER_TYPE.DEPARTMENT ? 'icon-invite_members' : 'icon-limit-principal',
            { violet: type === NODE_TYPE.APPROVAL },
            { green: type === NODE_TYPE.NOTICE },
            { skyBlue: type === NODE_TYPE.WRITE },
            { blue: type === NODE_TYPE.MESSAGE || type === NODE_TYPE.EMAIL },
          )}
        />

        <div className="mLeft10 ellipsis bold">{item.entityName}</div>
      </div>
    );
  }

  render() {
    const { accounts } = this.props;
    const nullText = {
      [USER_TYPE.ROLE]: _l('角色下未设置人员'),
      [USER_TYPE.DEPARTMENT]: _l('部门下未设置人员'),
      [USER_TYPE.JOB]: _l('职位下未设置人员'),
    };

    return (
      <ul className="flowDetailMembers">
        {(accounts || []).map((item, i) => {
          return (
            <li key={i} className="flexRow" style={{ zIndex: accounts.length - i }}>
              {item.type === USER_TYPE.USER && this.renderUser(item)}
              {item.type === USER_TYPE.ROLE && this.renderRole(item)}
              {item.type === USER_TYPE.CONTROL && this.renderControl(item, i)}
              {item.type === USER_TYPE.TEXT && this.renderText(item)}
              {item.type === USER_TYPE.DEPARTMENT && this.renderDepartmentOrJob(item)}
              {item.type === USER_TYPE.JOB && this.renderDepartmentOrJob(item)}

              <span className="mLeft5 flowDetailMemberDel" data-tip={_l('刪除')} onClick={() => this.removeMember(i)}>
                <i className="icon-delete Font18" />
              </span>
              {_.includes([USER_TYPE.ROLE, USER_TYPE.DEPARTMENT, USER_TYPE.JOB], item.type) && !item.count && (
                <div className="flowDetailMemberError flex">
                  <i className="mRight5 Font16 icon-workflow_error" />
                  {nullText[item.type]}
                </div>
              )}
              {_.includes([USER_TYPE.ROLE], item.type) && item.count === -1 && (
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
