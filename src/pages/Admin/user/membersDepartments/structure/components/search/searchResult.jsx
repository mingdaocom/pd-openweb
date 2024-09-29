import React from 'react';
import PropTypes from 'prop-types';
import { formatSearchDeptData } from '../../modules/util';
import { LoadDiv } from 'ming-ui';
import withClickAway from 'ming-ui/decorators/withClickAway';
import _ from 'lodash';
import filterXSS from 'xss';

@withClickAway
class Result extends React.Component {
  renderDepartments = (departments = [], keywords) => {
    if (!departments || !departments.length) return null;
    const result = formatSearchDeptData(departments, keywords);
    const list = _.map(result, (department, index) => (
      <div
        dangerouslySetInnerHTML={{ __html: filterXSS(department.departmentName) }}
        key={`${index}_${department.id}`}
        className="deptItem"
        onClick={() => {
          this.props.onDepartmentClick(department);
        }}
      ></div>
    ));
    return (
      <div className="searchDepartmentList">
        <div className="title">
          {_l('部门')}（{result.length}）
        </div>
        <div>{list}</div>
      </div>
    );
  };
  renderUsers = users => {
    if (!users || !users.length) return null;
    return (
      <div className="searchUserList">
        <div className="title">
          {_l('员工')}（{users.length}）
        </div>
        <div>
          {_.map(users, user => (
            <div
              key={user.accountId}
              className="userItem clearfix"
              onClick={() => {
                this.props.onUserClick(user.accountId);
              }}
            >
              <img src={user.avatar} alt={user.fullname} className="avatar mTop2" />
              <div className="info pLeft40">
                <span className="name">{user.fullname}</span>
                <span className="job">{user.jobs.map(item => item.name).join('、')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  render() {
    const { keywords, data = {}, isSearching, showResult } = this.props;
    if (!showResult) {
      return null;
    }
    if (isSearching) {
      return (
        <div className="searchResult pTop20">
          <LoadDiv />
        </div>
      );
    }
    const { departments = [], users = [] } = data;
    if (departments.length > 0 || users.length > 0) {
      return (
        <div className="searchResult">
          {this.renderUsers(users)}
          {this.renderDepartments(departments, keywords)}
        </div>
      );
    } else {
      return (
        <div className="searchResult">
          <div className="TxtCenter Gray_c" style={{ paddingTop: '80px' }}>
            {_l('无搜索结果')}
          </div>
        </div>
      );
    }
  }
}

export default Result;
