import React, { Component, Fragment } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import EmptyStatus from './EmptyStatus';
import * as actions from '../../../../redux/position/action';
import UserHead from 'src/components/userHead';
import { Checkbox } from 'ming-ui';
import cx from 'classnames';
import _ from 'lodash';

class RoleUserList extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {}
  renderThead = () => {
    const { selectUserIds = [], userList = [] } = this.props;
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
              className={cx({ checkBoxHalf: !_.isEmpty(temp) && !isSelectAll })}
              checked={isSelectAll || !_.isEmpty(temp)}
              onClick={checked => {
                let ids = [];
                if (!checked || (!_.isEmpty(selectUserIds) && selectUserIds.length !== userList.length)) {
                  ids = userList.map(item => item.accountId);
                } else {
                  ids = [];
                }
                this.props.updateSelectUserIds(ids);
              }}
            />
          </th>
          <th className="nameCol">{_l('姓名')}</th>
          <th className="departmentCol">{_l('部门')}</th>
        </tr>
      </thead>
    );
  };
  renderCon = () => {
    const { userList = [], selectUserIds = [] } = this.props;
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
          <td className="nameCol">
            <div className="flexRow">
              <UserHead
                className="circle"
                user={{
                  userHead: item.avatar,
                  accountId: item.accountId,
                }}
                size={32}
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
        </tr>
      );
    });
  };
  render() {
    const { userList = [] } = this.props;
    return (
      <Fragment>
        <div className="useTableHeader">
          <table className="fixedTable usersTable" cellSpacing="0">
            {this.renderThead(this.props)}
          </table>
        </div>
        <div className="userTableBody">
          {_.isEmpty(userList) ? (
            <EmptyStatus tipTxt={_l('数据空')} icon="Empty_data" />
          ) : (
            <table className="usersTable overflowTable" cellSpacing="0">
              <tbody>{this.renderCon()}</tbody>
            </table>
          )}
        </div>
      </Fragment>
    );
  }
}

export default connect(
  state => {
    const { userList, selectUserIds } = state.orgManagePage.position;
    return { userList, selectUserIds };
  },
  dispatch =>
    bindActionCreators(
      { ..._.pick(actions, ['updateProjectId', 'getPositionList', 'updateCurrentPosition', 'updateSelectUserIds']) },
      dispatch,
    ),
)(RoleUserList);
