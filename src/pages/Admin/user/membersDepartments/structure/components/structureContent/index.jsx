import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { LoadDiv, Checkbox, Dialog, antNotification } from 'ming-ui';
import * as entitiesActions from '../../actions/entities';
import * as currentActions from '../../actions/current';
import DialogBatchEdit from '../../modules/dialogBatchEdit';
import UserTable from '../userList/userTable';
import ApprovalContent from '../ApprovalContent';
import RoleController from 'src/api/role';
import cx from 'classnames';
import PaginationWrap from 'src/pages/Admin/components/PaginationWrap';
import addFriends from 'src/components/addFriends';
import AddUser from '../AddUser';
import userAjax from 'src/api/user';

class StructureContent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      batchEditVisible: false,
      isSuperAdmin: false,
    };
  }

  componentDidMount() {
    this.loadData();
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

  loadData = (pageIndex = 1) => {
    const { departmentId, typeCursor, projectId, noDepartmentUsers } = this.props;
    if (!!departmentId || noDepartmentUsers) {
      this.props.loadUsers(noDepartmentUsers ? '' : departmentId, pageIndex);
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

    const count = typeCursor === 3 ? approveNumber : allCount;

    return (
      <span className={cx('color_9e mLeft6 mRight8', { TxtMiddle: departmentId })}>
        {!_.isUndefined(count) ? count : ''}
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

  // 批量离职
  batchResign = () => {
    const { selectedAccountIds, projectId, updateSelectedAccountIds = () => {} } = this.props;
    if (selectedAccountIds.length > 50) {
      alert(_l('请注意，单次批量离职人数不得超过50人'), 2);
      return;
    }
    Dialog.confirm({
      title: _l('批量离职'),
      buttonType: 'danger',
      description: (
        <div className="Gray">
          {_l('您共勾选了')}
          <span className="ThemeColor"> {selectedAccountIds.length} </span>
          {_l('个成员，是否确认将勾选成员离职？')}
        </div>
      ),
      okText: _l('确认'),
      onOk: () => {
        userAjax
          .removeUsers({
            projectId,
            accountIds: selectedAccountIds,
          })
          .then(res => {
            if (res.result === 1) {
              this.loadData();
              updateSelectedAccountIds([]);
            } else if (res.result === 3) {
              let users = (res.failedNames || []).map(u => `"${u}"`).join('、');

              antNotification['error']({
                className: 'removeUserErr',
                key: 'removeUserErr',
                duration: 5,
                message: _l('批量离职失败'),
                description: (
                  <div>
                    <div>{_l('您操作的成员批量离职失败')}</div>
                    <div>{_l('失败原因：用户%0是超级管理员，不可离职', users)}</div>
                  </div>
                ),
              });
            } else if (res.result === 101) {
              alert(_l('请注意，您勾选了自己，无法进行离职操作。'), 2);
            }
          });
      },
    });
  };

  // 重新邀请
  reInvite = () => {
    const { selectedAccountIds } = this.props;

    Dialog.confirm({
      title: _l(' 重新邀请'),
      description: (
        <div className="Gray">
          {_l('您共勾选了')} <span className="ThemeColor"> {selectedAccountIds.length} </span> {_l('个用户')}
        </div>
      ),
      okText: _l('邀请'),
      onOk: () => {
        this.props.fetchReInvite(selectedAccountIds);
      },
    });
  };

  // 取消邀请并移除
  cancelAndRemove = () => {
    const { selectedAccountIds, projectId } = this.props;

    Dialog.confirm({
      title: _l('取消邀请并移除'),
      buttonType: 'danger',
      description: (
        <div className="Gray">
          {_l('您共勾选了')} <span className="ThemeColor"> {selectedAccountIds.length} </span>
          {_l('个成员，是否确认取消邀请勾选用户?')}
        </div>
      ),
      okText: _l('确认'),
      onOk: () => {
        this.props.fetchCancelImportUser(selectedAccountIds, () => {
          this.props.loadInactiveUsers(projectId, 1);
          this.props.fetchInActive(projectId);
          this.props.updateSelectedAccountIds([]);
        });
      },
    });
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
      isLoading,
      noDepartmentUsers,
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
                checked={noDepartmentUsers}
                onClick={(checked, id) => {
                  this.props.updateNoDepartmentUsers(!checked);
                  this.props.updateCursor('');
                  if (checked) {
                    this.props.updateTypeCursor(0);
                    this.props.loadAllUsers(projectId, 1);
                  } else {
                    this.props.updateTypeCursor(1);
                    this.props.loadUsers('', 1);
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
        {typeCursor !== 3 && (
          <div className="actList flexRow">
            {typeCursor === 0 || typeCursor === 1 || departmentId ? (
              <Fragment>
                <div className="actBtn primaryBtn" onClick={this.addUser}>
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
                <div
                  className={cx('actBtn', { disabledBtn: _.isEmpty(selectedAccountIds) })}
                  onClick={_.isEmpty(selectedAccountIds) ? () => {} : this.batchResign}
                >
                  {_l('批量离职')}
                </div>
              </Fragment>
            ) : typeCursor === 2 ? (
              <Fragment>
                <div
                  className={cx('actBtn', { disabledBtn: _.isEmpty(selectedAccountIds) })}
                  onClick={_.isEmpty(selectedAccountIds) ? () => {} : this.reInvite}
                >
                  {_l('重新邀请')}
                </div>
                <div
                  className={cx('actBtn', { disabledBtn: _.isEmpty(selectedAccountIds) })}
                  onClick={_.isEmpty(selectedAccountIds) ? () => {} : this.cancelAndRemove}
                >
                  {_l('取消邀请并移除')}
                </div>
              </Fragment>
            ) : (
              ''
            )}
          </div>
        )}
        <div className="listInfo">
          {isLoading && typeCursor !== 3 ? (
            <div className="laodingContainer">
              <LoadDiv />
            </div>
          ) : typeCursor === 3 ? (
            <ApprovalContent projectId={projectId} {...this.props} />
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
            fetchReInvite={this.props.fetchReInvite}
            fetchCancelImportUser={this.props.fetchCancelImportUser}
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
    const {
      departmentId,
      root,
      projectId,
      typeNum,
      typeCursor,
      selectedAccountIds,
      isSelectAll,
      approveNumber,
      userStatus,
      noDepartmentUsers,
    } = current;
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
      userStatus,
      noDepartmentUsers,
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
          'fetchReInvite',
          'fetchCancelImportUser',
          'updateSelectedAccountIds',
          'updateUserStatus',
          'updateNoDepartmentUsers',
        ]),
      },
      dispatch,
    ),
)(StructureContent);
