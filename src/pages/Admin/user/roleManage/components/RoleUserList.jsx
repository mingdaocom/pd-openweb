import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Checkbox, Icon, UserHead } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { dialogSelectDept } from 'ming-ui/functions';
import departmentController from 'src/api/department';
import OrganizeAjax from 'src/api/organize';
import EmptyStatus from './EmptyStatus';

const Departments = styled.div`
  width: fit-content;
  display: flex;
  flex-wrap: nowrap;
  gap: 10px;
  align-items: center;
  max-width: 300px;
  .departmentValue {
    max-width: 300px;
    display: inline-block;
  }
`;

class RoleUserList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fixedLeft: false,
      fixedRight: false,
      departmentsPath: [],
    };
    this.scrollRef = React.createRef();
    this.scrollNullHeadRef = React.createRef();
  }

  setDeptRange = item => {
    const { projectId, roleId } = this.props;

    dialogSelectDept({
      projectId,
      className: 'roleSetDeptRangeDialog',
      title: _l('设置分管部门'),
      unique: false,
      fromAdmin: true,
      showCreateBtn: false,
      checkIncludeChilren: true,
      selectedDepartment:
        (item.orgRoleChargeDepartments || []).map(l => {
          return { ...l, checkIncludeChilren: true };
        }) || [],
      selectFn: (dep, dep2) => {
        const departmentIds = dep2.map(l => ({ departmentId: l.departmentId, isIncludeSub: true }));
        OrganizeAjax.setOrgRoleChargeDepartment({
          projectId,
          orgRoleId: roleId,
          accountId: item.accountId,
          departmentIds: departmentIds,
        }).then(res => {
          res && this.props.updateUerList();
        });
      },
    });
  };

  getDeptPath = item => {
    const { orgRoleChargeDepartments, accountId } = item;
    const { departmentsPath } = this.state;
    const { projectId } = this.props;

    if (
      departmentsPath.find(l => l.accountId === item.accountId) ||
      !orgRoleChargeDepartments ||
      orgRoleChargeDepartments.length === 0
    )
      return;

    departmentController
      .getDepartmentFullNameByIds({
        projectId,
        departmentIds: orgRoleChargeDepartments.map(l => l.departmentId),
      })
      .then(res => {
        this.setState({
          departmentsPath: departmentsPath.concat({
            accountId: accountId,
            departments: res,
          }),
        });
      });
  };

  renderDepartments = item => {
    const { departmentsPath } = this.state;
    const { orgRoleChargeDepartments = [] } = item;

    return (
      <Departments>
        <div
          onMouseEnter={() => this.getDeptPath(item)}
          key={`roleUserDepartmentRange-${item.accountId}`}
          className="Hand"
        >
          <Tooltip
            title={
              !orgRoleChargeDepartments || orgRoleChargeDepartments.length === 0 ? (
                ''
              ) : (
                <div>
                  {(departmentsPath.find(l => l.accountId === item.accountId) || { departments: [] }).departments.map(
                    l => (
                      <div>{l.name}</div>
                    ),
                  )}
                </div>
              )
            }
            mouseEnterDelay={0.5}
          >
            <span className="departmentValue overflow_ellipsis">
              {orgRoleChargeDepartments.map(l => l.departmentName).join('、') || '-'}
            </span>
          </Tooltip>
        </div>
      </Departments>
    );
  };

  renderThead = () => {
    const { selectUserIds = [], userList = [] } = this.props;
    const { fixedLeft, fixedRight } = this.state;
    let temp =
      userList.filter(item => {
        return selectUserIds.some(it => it === item.accountId);
      }) || [];
    let isSelectAll = !_.isEmpty(selectUserIds) && temp.length === userList.length;
    return (
      <thead>
        <tr>
          <th className="checkBoxCol">
            <Checkbox
              clearselected={!_.isEmpty(temp) && !isSelectAll}
              checked={isSelectAll || !_.isEmpty(temp)}
              onClick={checked => {
                let ids = [];
                if (!checked) {
                  ids = userList.map(item => item.accountId);
                } else {
                  ids = [];
                }
                this.props.updateSelectUserIds(ids);
              }}
            />
          </th>
          <th className={cx('nameCol', { fixedLeft: fixedLeft })}>{_l('姓名')}</th>
          <th className="numberCol">{_l('工号')}</th>
          <th className="departmentCol">{_l('部门')}</th>
          <th className="positionCol">{_l('职位')}</th>
          <th className="departmentRangeCol">
            {_l('分管部门')}
            <Tooltip
              placement="bottom"
              title={
                <span>
                  {_l('为角色人员指定分管范围，在审批流程中可以动态获取当前角色中对应的分管负责人进行审批。')}
                </span>
              }
            >
              <Icon icon="info" className="mLeft6 Font14 Gray_9e" />
            </Tooltip>
          </th>
          <th className={cx('actionCol', { fixedRight: fixedRight })}></th>
        </tr>
      </thead>
    );
  };

  renderCon = () => {
    const { userList = [], selectUserIds = [] } = this.props;
    const { fixedLeft, fixedRight } = this.state;
    return userList.map(item => {
      return (
        <tr key={item.accountId}>
          <td className="checkBoxCol">
            <Checkbox
              checked={_.includes(selectUserIds, item.accountId)}
              onClick={checked => {
                let ids = [...selectUserIds];
                if (!checked) {
                  ids.push(item.accountId);
                } else {
                  ids = ids.filter(it => item.accountId !== it);
                }
                this.props.updateSelectUserIds(ids);
              }}
            />
          </td>
          <td className={cx('nameCol', { fixedLeft: fixedLeft })}>
            <div className="flexRow">
              <UserHead
                className="circle"
                user={{
                  userHead: item.avatar,
                  accountId: item.accountId,
                }}
                size={32}
                projectId={this.props.projectId}
              />
              <a
                href={'/user_' + item.accountId}
                className="Gray overflow_ellipsis mLeft10 LineHeight32 name"
                title={item.fullname}
              >
                {item.fullname}
              </a>
            </div>
          </td>
          <td className="numberCol">{item.jobNumber}</td>
          <td
            className="departmentCol"
            title={item.departments.map((it, i) => {
              if (item.departments.length - 1 > i) {
                return `${it.name};`;
              }
              return `${it.name}`;
            })}
          >
            {item.departments.map((it, i) => {
              if (item.departments.length - 1 > i) {
                return `${it.name};`;
              }
              return `${it.name}`;
            })}
          </td>
          <td
            className="positionCol"
            title={(item.jobs || []).map((it, i) => {
              if (item.jobs.length - 1 > i) {
                return `${it.name};`;
              }
              return `${it.name}`;
            })}
          >
            {(item.jobs || []).map((it, i) => {
              if (item.jobs.length - 1 > i) {
                return `${it.name};`;
              }
              return `${it.name}`;
            })}
          </td>
          <td className="departmentRangeCol">{this.renderDepartments(item)}</td>
          <td className={cx('actionCol', { fixedRight: fixedRight })}>
            <span className="settingButton Hand" onClick={() => this.setDeptRange(item)}>
              {_l('设置')}
            </span>
          </td>
        </tr>
      );
    });
  };

  handleScroll = type => {
    const ref = type === 0 ? this.scrollNullHeadRef : this.scrollRef;
    if (!ref.current) return;

    const { fixedLeft, fixedRight } = this.state;

    let scrollLeft = ref.current.scrollLeft;

    if (!!(scrollLeft > 0) !== fixedLeft) {
      this.setState({ fixedLeft: scrollLeft > 0 });
    }

    let flag = ref.current.scrollWidth - ref.current.scrollLeft === this.scrollRef.current.clientWidth;
    if (flag === fixedRight) {
      this.setState({ fixedRight: !flag });
    }
  };

  render() {
    const { userList = [] } = this.props;

    return (
      <Fragment>
        {_.isEmpty(userList) && (
          <div className="useTableHeader" ref={this.scrollNullHeadRef} onScroll={() => this.handleScroll(0)}>
            <table className="fixedTable usersTable" cellSpacing="0">
              {this.renderThead(this.props)}
            </table>
          </div>
        )}
        <div className="userTableBody" ref={this.scrollRef} onScroll={() => this.handleScroll(1)}>
          {_.isEmpty(userList) ? (
            <EmptyStatus tipTxt={_l('当前组织角色无成员')} icon="Empty_data" />
          ) : (
            <table className="usersTable overflowTable" cellSpacing="0">
              {this.renderThead()}
              <tbody>{this.renderCon()}</tbody>
            </table>
          )}
        </div>
      </Fragment>
    );
  }
}

export default RoleUserList;
