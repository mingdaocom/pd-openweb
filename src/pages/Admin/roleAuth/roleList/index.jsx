import React from 'react';
import PropTypes from 'prop-types';
import RoleController from 'src/api/role';
import PaginationWrap from '../../components/PaginationWrap';
import LoadDiv from 'ming-ui/components/LoadDiv';
import RoleItem from './roleItem';
import RoleAuthCommon from '../common/common';

import './style.less';
import _ from 'lodash';

class RoleList extends React.Component {
  static propTypes = {
    projectId: PropTypes.string.isRequired,
    isApply: PropTypes.bool,
    manualRef: PropTypes.func,
  };

  static defaultProps = {
    isApply: false,
  };

  constructor(props) {
    super();
    this.state = {
      isLoading: false,
      pageIndex: 1,
      pageSize: 500,
      totalCount: null,
      list: null,
    };

    this.fetchRoles = this.fetchRoles.bind(this);
  }

  componentDidMount() {
    const { manualRef } = this.props;
    if (manualRef) {
      manualRef(this);
    }
  }

  componentWillMount() {
    this.fetchRoles();
  }

  fetchRoles(isReload) {
    const { projectId, isApply } = this.props;
    const { isLoading, pageIndex, pageSize } = this.state;
    if (isLoading) return false;

    this.setState({
      isLoading: true,
    });

    this.promise = RoleController.getSummaryRole({
      projectId,
      isJoined: !isApply,
      pageIndex: isReload ? 1 : pageIndex,
      pageSize,
    });

    this.promise
      .then(({ listSumaryRole: listSummaryRole, allCount } = {}) => {
        if (listSummaryRole) {
          this.setState(prevState => {
            return {
              pageIndex: isReload ? 1 : pageIndex,
              isLoading: false,
              totalCount: allCount,
              list: _.map(listSummaryRole, role => {
                RoleAuthCommon.formatRoleAuth(role);
                return role;
              }),
            };
          });
        } else {
          return $.Deferred().reject().promise();
        }
      })
      .fail(errors => {
        this.setState({
          isLoading: false,
        });
        alert(errors.errorMessage || _l('获取列表失败'), 2);
      });
  }

  renderList() {
    const { list } = this.state;
    const { projectId, isApply } = this.props;
    const isHrVisible = md.global.Account.projects.find(o => o.projectId === projectId).isHrVisible;

    return _.map(list, role => (
      <RoleItem
        isHrVisible={isHrVisible}
        isApply={isApply}
        role={role}
        projectId={projectId}
        callback={this.fetchRoles}
        key={role.roleId}
      />
    ));
  }

  render() {
    const { isLoading, list, totalCount, pageSize, pageIndex } = this.state;
    return (
      <div className="roleAuthTable">
        <table className="w100 verticalTop">
          <thead>
            <tr className="roleListTitle">
              <th className="roleName">{_l('角色名称')}</th>
              <th className="roleCount">{_l('人数')}</th>
              <th className="roleAuth">{_l('权限')}</th>
              <th className="roleOperation">{_l('操作')}</th>
            </tr>
          </thead>
        </table>
        <div className="roleList">
          <table className="w100">
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="4">
                    <LoadDiv />
                  </td>
                </tr>
              ) : (
                this.renderList()
              )}
            </tbody>
          </table>
        </div>
        {list && totalCount > pageSize ? (
          <PaginationWrap
            total={totalCount}
            pageIndex={pageIndex}
            pageSize={pageSize}
            onChange={pageIndex => this.setState({ pageIndex }, this.fetchRoles)}
          />
        ) : null}
      </div>
    );
  }
}

export default RoleList;
