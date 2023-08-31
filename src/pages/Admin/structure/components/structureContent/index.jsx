import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { LoadDiv, Checkbox, Icon } from 'ming-ui';
import * as entitiesActions from '../../actions/entities';
import * as currentActions from '../../actions/current';
import DialogBatchEdit from '../../modules/dialogBatchEdit';
import UserTable from '../userList/userTable';
import RoleController from 'src/api/role';
import cx from 'classnames';
import PaginationWrap from 'src/pages/Admin/components/PaginationWrap';
import addFriends from 'src/components/addFriends/addFriends';
import AddUser from '../AddUser';

class StructureContent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      batchEditVisible: false,
      isSuperAdmin: false,
    };
  }

  componentDidMount() {
    this.loadData(1);
    md.global.Config.IsLocal && this.getPermission();
  }
  componentWillUnmount() {
    localStorage.removeItem('columnsInfoData');
  }
  getPermission = () => {
    const { projectId } = this.props;
    RoleController.getProjectPermissionsByUser({
      projectId: projectId,
    }).then(data => {
      this.setState({ isSuperAdmin: data.isSuperAdmin });
    });
  };

  loadData = pageIndex => {
    const { departmentId, typeCursor, projectId } = this.props;
    if (!!departmentId) {
      this.props.loadUsers(departmentId, pageIndex);
    } else {
      switch (typeCursor) {
        case 0:
          this.props.loadAllUsers(projectId, pageIndex);
          break;
        case 1:
          this.props.loadAllUsers(departmentId, pageIndex);
          break;
        case 2:
          this.props.loadInactiveUsers(projectId, pageIndex);
          break;
        case 3:
          this.props.loadApprovalUsers(projectId, pageIndex);
          break;
      }
    }
  };

  renderUserCount() {
    const { allCount, departmentId, typeCursor, approveNumber } = this.props;

    return (
      <span className={cx('color_9e mLeft6 mRight8', { TxtMiddle: departmentId })}>
        {!_.isUndefined(allCount) ? allCount : ''}
      </span>
    );
  }
  // 添加成员
  addUser = () => {
    this.setState({ openChangeUserInfoDrawer: true });
  };
  // 邀请加入
  inviteMore = () => {
    const { projectId } = this.props;

    addFriends({
      projectId: projectId,
      fromType: 4,
    });
  };
  // 导入导出
  exportInAndOut = () => {
    this.props.updateShowExport(true);
  };
  //  批量编辑
  batchEdit = () => {
    this.setState({ batchEditVisible: true });
  };

  // 分页
  changPage = page => {
    this.loadData(page);
  };

  render() {
    const {
      allCount,
      pageIndex,
      isSearch,
      typeNum = 0,
      projectId,
      departmentId,
      departmentInfos,
      typeCursor = 0,
      selectedAccountIds = [],
      departmentName,
      pageSize,
      isSelectAll,
      isLoading,
      removeUserFromSet = () => {},
    } = this.props;
    let { batchEditVisible, batchResetPasswordVisible, openChangeUserInfoDrawer } = this.state;
    return (
      <Fragment>
        {!isSearch ? (
          <div className="Font17 departmentTitle">
            <span className="departmentNameValue" title={!!departmentId && departmentName}>
              {!!departmentId && departmentName}
            </span>
            {(typeCursor === 0 || typeCursor === 1) && !departmentId && _l('全组织')}
            {typeCursor === 2 && _l('未激活')}
            {typeCursor === 3 && _l('待审核')}
            {this.renderUserCount()}
            {(typeCursor === 0 || typeCursor === 1) && !departmentId && (
              <Checkbox
                className="InlineBlock Gray_9e Font12 TxtMiddle LineHeight24 noDepartment"
                defaultChecked={typeCursor === 1}
                onClick={(checked, id) => {
                  this.props.updateCursor('');
                  if (checked) {
                    this.props.updateTypeCursor(1);
                    this.props.loadUsers('', 1);
                  } else {
                    this.props.updateTypeCursor(0);
                    this.props.loadAllUsers(projectId, 1);
                  }
                }}
              >
                <span className="Font12">{_l('仅看无部门人员')}</span>
              </Checkbox>
            )}
          </div>
        ) : (
          ''
        )}
        {(typeCursor === 0 || typeCursor === 1 || departmentId) && (
          <div className="actList flexRow">
            <div className="actBtn" onClick={this.addUser}>
              {_l('添加成员')}
            </div>
            <div className="actBtn" onClick={this.inviteMore}>
              {_l('更多邀请')}
            </div>
            <div className="actBtn" onClick={this.exportInAndOut}>
              {_l('导入 / 导出 / 修改')}
            </div>
            <div
              className={cx('actBtn', { disabledBtn: _.isEmpty(selectedAccountIds) })}
              onClick={_.isEmpty(selectedAccountIds) ? () => {} : this.batchEdit}
            >
              {_l('批量编辑')}
            </div>
          </div>
        )}
        <div className="listInfo">
          {isLoading ? (
            <div className="laodingContainer">
              <LoadDiv />
            </div>
          ) : (
            <UserTable projectId={projectId} />
          )}
          <PaginationWrap total={allCount} pageIndex={pageIndex} pageSize={pageSize || 50} onChange={this.changPage} />
        </div>

        {batchEditVisible && (
          <DialogBatchEdit
            visible={batchEditVisible}
            selectedAccountIds={selectedAccountIds}
            projectId={projectId}
            loadData={this.loadData}
            removeUserFromSet={removeUserFromSet}
            onCancel={() => {
              this.setState({ batchEditVisible: false });
            }}
          />
        )}
        {batchResetPasswordVisible && this.renderBatchResetPassword()}

        {openChangeUserInfoDrawer && (
          <AddUser
            projectId={projectId}
            typeCursor={typeCursor}
            actType={'add'}
            departmentInfos={!departmentId || typeNum !== 0 ? '' : departmentInfos}
            onClose={() => {
              this.setState({ openChangeUserInfoDrawer: false });
            }}
            getData={this.props.fetchApproval}
            cancelInviteRemove={() => this.props.loadInactiveUsers(projectId, pageIndex)}
            departmentId={departmentId}
            refreshData={this.loadData}
            fetchInActive={() => this.props.fetchInActive(projectId)}
            fetchApproval={() => this.props.fetchApproval(projectId)}
          />
        )}
      </Fragment>
    );
  }
}

export default connect(
  state => {
    const {
      current,
      pagination: { userList = [] },
    } = state;
    const { departmentId, root, projectId, typeNum, typeCursor, selectedAccountIds, isSelectAll, approveNumber } =
      current;
    const isRoot = departmentId === root;
    const { departments } = state.entities;
    let departmentInfos = departments[departmentId];
    return {
      typeNum,
      typeCursor,
      selectedAccountIds,
      isRoot,
      departmentId,
      projectId,
      isSearch: userList && userList.isSearchResult,
      allCount: userList && userList.allCount,
      pageIndex: userList && userList.pageIndex,
      pageSize: userList && userList.pageSize,
      isLoading: userList && userList.isLoading,
      departmentName: departmentInfos ? departmentInfos.departmentName : '',
      selectCount: selectedAccountIds.length,
      isSelectAll,
      userList,
      departmentInfos,
      approveNumber,
    };
  },
  dispatch =>
    bindActionCreators(
      {
        ..._.pick({ ...entitiesActions, ...currentActions }, [
          'updateCursor',
          'updateTypeCursor',
          'loadUsers',
          'updateTypeCursor',
          'loadAllUsers',
          'loadInactiveUsers',
          'loadApprovalUsers',
          'fetchApproval',
          'updateShowExport',
          'emptyUserSet',
          'removeUserFromSet',
          'fetchInActive',
          'fetchApproval',
        ]),
      },
      dispatch,
    ),
)(StructureContent);
