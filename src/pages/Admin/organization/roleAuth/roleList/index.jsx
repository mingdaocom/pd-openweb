import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import roleController from 'src/api/role';
import projectSettingAjax from 'src/api/projectSetting';
import PaginationWrap from '../../../components/PaginationWrap';
import LoadDiv from 'ming-ui/components/LoadDiv';
import RoleItem from './roleItem';
import RoleAuthCommon from '../common/common';
import { getCurrentProject } from 'src/util';
import { Icon } from 'ming-ui';

import './style.less';
import _ from 'lodash';

class RoleList extends React.Component {
  static propTypes = {
    projectId: PropTypes.string.isRequired,
    manualRef: PropTypes.func,
  };

  constructor(props) {
    super();
    this.state = {
      isLoading: false,
      pageIndex: 1,
      pageSize: 500,
      totalCount: null,
      list: null,
      applyList: [],
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
    this.getCanApplyRoles();
  }

  fetchRoles(isReload) {
    const { projectId, entry } = this.props;
    const { isLoading, pageIndex, pageSize } = this.state;
    if (isLoading) return false;
    if (entry === 'apply') return;

    this.setState({
      isLoading: true,
    });

    this.promise = roleController.getSummaryRole({
      projectId,
      isJoined: true,
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
          return Promise.reject();
        }
      })
      .catch(errors => {
        this.setState({
          isLoading: false,
        });
        alert(errors.errorMessage || _l('获取列表失败'), 2);
      });
  }

  getCanApplyRoles = async () => {
    const { projectId } = this.props;
    const { pageSize } = this.state;
    const { isSuperAdmin } = getCurrentProject(projectId);

    if (isSuperAdmin) return;

    const allowApplyManage = await projectSettingAjax.getAllowApplyManageRole({ projectId });

    if (!allowApplyManage) return;

    const res = await roleController.getSummaryRole({
      projectId,
      isJoined: false,
      pageIndex: 1,
      pageSize,
    });

    const { listSumaryRole: listSummaryRole } = res;

    this.setState({
      applyList: listSummaryRole.filter(r => !r.isJoined),
    });
  };

  renderList() {
    const { list } = this.state;
    const { projectId, entry } = this.props;
    const { isHrVisible } = getCurrentProject(projectId, true);

    return _.map(list, role => (
      <RoleItem
        isHrVisible={isHrVisible}
        role={role}
        projectId={projectId}
        callback={this.fetchRoles}
        key={role.roleId}
        entry={entry}
      />
    ));
  }

  renderApplyList = () => {
    const { applyList } = this.state;
    const { projectId, entry } = this.props;
    const { isHrVisible } = getCurrentProject(projectId, true);

    return _.map(applyList, role => (
      <RoleItem
        isHrVisible={isHrVisible}
        isApply={true}
        role={role}
        projectId={projectId}
        key={role.roleId}
        entry={entry}
      />
    ));
  };

  render() {
    const { entry } = this.props;
    const { isLoading, list, totalCount, pageSize, pageIndex, applyList, showApplyRole } = this.state;

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
                <Fragment>
                  {this.renderList()}
                  {_.isEmpty(applyList) ? (
                    ''
                  ) : entry === 'apply' ? (
                    this.renderApplyList()
                  ) : (
                    <Fragment>
                      <div
                        className="ThemeColor mTop16 InlineBlock Hand"
                        onClick={() => this.setState({ showApplyRole: !showApplyRole })}
                      >
                        {_l('申请角色权限')}
                        <Icon className="mLeft6 Font16" icon={showApplyRole ? 'arrow-up' : 'arrow-down'} />
                      </div>
                      {showApplyRole && this.renderApplyList()}
                    </Fragment>
                  )}
                </Fragment>
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
