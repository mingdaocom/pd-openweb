import React, { Fragment } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Icon } from 'ming-ui';
import LoadDiv from 'ming-ui/components/LoadDiv';
import projectSettingAjax from 'src/api/projectSetting';
import roleApi from 'src/api/role';
import { getCurrentProject } from 'src/utils/project';
import PaginationWrap from '../../../components/PaginationWrap';
import CreateEditRole from '../createEditRole';
import RoleDetail from '../roleDetail';
import RoleItem from './roleItem';
import './style.less';

class RoleList extends React.Component {
  static propTypes = {
    projectId: PropTypes.string.isRequired,
    manualRef: PropTypes.func,
  };

  constructor() {
    super();
    this.state = {
      isLoading: false,
      pageIndex: 1,
      pageSize: 500,
      totalCount: null,
      list: [],
      applyList: [],
      drawer: { visible: false },
      hasChanged: false,
    };

    this.getMyRoles = this.getMyRoles.bind(this);
  }

  componentDidMount() {
    const { manualRef } = this.props;
    if (manualRef) {
      manualRef(this);
    }
  }

  componentWillMount() {
    this.getMyRoles();
    this.getCanApplyRoles();
  }

  getMyRoles(isReload) {
    const { projectId, entry } = this.props;
    const { isLoading, pageIndex, pageSize } = this.state;
    if (isLoading || entry === 'apply') return;

    const { isSuperAdmin } = getCurrentProject(projectId);

    this.setState({ isLoading: true });

    (isSuperAdmin ? roleApi.pagedRoleList : roleApi.getMyJoinedRoleList)({
      projectId,
      isJoined: true,
      pageIndex: isReload ? 1 : pageIndex,
      pageSize,
    })
      .then(({ roles, totalCount } = {}) => {
        this.setState({
          pageIndex: isReload ? 1 : pageIndex,
          isLoading: false,
          totalCount,
          list: roles || [],
        });
      })
      .catch(errors => {
        this.setState({ isLoading: false });
        alert(errors.errorMessage || _l('获取列表失败'), 2);
      });
  }

  getCanApplyRoles = async () => {
    const { projectId, entry } = this.props;
    const { pageSize } = this.state;
    const { isSuperAdmin } = getCurrentProject(projectId);

    if (isSuperAdmin) return;

    if (entry !== 'apply') {
      const allowApplyManage = await projectSettingAjax.getAllowApplyManageRole({ projectId });

      if (!allowApplyManage) return;
    }

    const res = await roleApi.pagedApplyRoleList({
      projectId,
      isJoined: false,
      pageIndex: 1,
      pageSize,
    });
    res && this.setState({ applyList: res.roles });
  };

  renderList(isApply) {
    const { list, applyList, drawer, hasChanged } = this.state;
    const { projectId } = this.props;

    const onOpenDrawer = (role, type, closeNeedOpenDetail) => {
      this.setState({ drawer: { visible: true, role, type, closeNeedOpenDetail } });
    };

    return (
      <React.Fragment>
        {(isApply ? applyList : list).map(role => (
          <RoleItem
            key={role.roleId}
            isApply={isApply}
            role={role}
            projectId={projectId}
            selectedRole={role.roleId === drawer.role?.roleId}
            onOpenDrawer={type => onOpenDrawer(role, type)}
            onRefreshRoleList={this.getMyRoles}
          />
        ))}

        {drawer.visible && !drawer.type && (
          <RoleDetail
            projectId={projectId}
            role={drawer.role}
            onClose={() => {
              hasChanged && this.getMyRoles();
              this.setState({ drawer: { visible: false }, hasChanged: false });
            }}
            onOpenDrawer={type => onOpenDrawer(drawer.role, type, true)}
            onUpdateSuccess={() => this.setState({ hasChanged: true })}
            onUpdateRoleName={roleName => {
              const newList = list.map(item =>
                item.roleId === _.get(drawer, 'role.roleId') ? { ...item, roleName } : item,
              );
              this.setState({ list: newList, drawer: { ...drawer, role: { ...drawer.role, roleName } } });
            }}
            defaultTab={drawer.defaultTab}
          />
        )}

        {drawer.visible && drawer.type && (
          <CreateEditRole
            projectId={projectId}
            roleId={_.get(drawer, 'role.roleId')}
            roleName={_.get(drawer, 'role.roleName')}
            isEditHr={drawer.type === 'editHrRole'}
            onClose={() => {
              this.setState({
                drawer: drawer.closeNeedOpenDetail
                  ? { visible: true, role: drawer.role, defaultTab: 'auth' }
                  : { visible: false },
              });
            }}
            onSaveSuccess={!drawer.closeNeedOpenDetail ? this.getMyRoles : () => this.setState({ hasChanged: true })}
          />
        )}
      </React.Fragment>
    );
  }

  render() {
    const { entry } = this.props;
    const { isLoading, list, totalCount, pageSize, pageIndex, applyList, showApplyRole } = this.state;

    return (
      <div className="roleAuthTable">
        <div className="w100 verticalTop">
          <div className="roleItem roleListTitle">
            <div className="roleName">{_l('角色名称')}</div>
            <div className="roleMembers">{_l('成员')}</div>
            <div className="roleAuth">{_l('权限')}</div>
            <div className="roleOperation">{_l('操作')}</div>
          </div>
        </div>
        <div className="roleList">
          <div className="w100">
            {isLoading ? (
              <LoadDiv className="mTop10" />
            ) : (
              <Fragment>
                {this.renderList()}
                {!!applyList.length &&
                  (entry === 'apply' ? (
                    this.renderList(true)
                  ) : (
                    <Fragment>
                      <div
                        className="ThemeColor mTop16 InlineBlock Hand"
                        onClick={() => this.setState({ showApplyRole: !showApplyRole })}
                      >
                        {_l('申请角色权限')}
                        <Icon className="mLeft6 Font16" icon={showApplyRole ? 'arrow-up' : 'arrow-down'} />
                      </div>
                      {showApplyRole && this.renderList(true)}
                    </Fragment>
                  ))}
              </Fragment>
            )}
          </div>
        </div>
        {list && totalCount > pageSize && (
          <PaginationWrap
            total={totalCount}
            pageIndex={pageIndex}
            pageSize={pageSize}
            onChange={pageIndex => this.setState({ pageIndex }, this.getMyRoles)}
          />
        )}
      </div>
    );
  }
}

export default RoleList;
