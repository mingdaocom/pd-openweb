import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import _ from 'lodash';
import { Checkbox, Dialog } from 'ming-ui';
import RoleController from 'src/api/role';
import addFriends from 'src/components/addFriends';
import { checkCertification } from 'src/components/checkCertification';
import PaginationWrap from 'src/pages/Admin/components/PaginationWrap';
import * as currentActions from '../../actions/current';
import * as entitiesActions from '../../actions/entities';
import DialogBatchEdit from '../../modules/dialogBatchEdit';
import AddUser from '../AddUser';
import ApprovalContent from '../ApprovalContent';
import BatchResign from '../BatchResign';
import UserTable from '../userList/userTable';

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
    (window.platformENV.isOverseas || window.platformENV.isLocal) && this.getPermission();
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

  // 重新邀请
  reInvite = () => {
    const { selectedAccountIds } = this.props;

    Dialog.confirm({
      title: _l('重新邀请'),
      description: (
        <div className="textPrimary">
          {_l('您共勾选了')} <span className="colorPrimary"> {selectedAccountIds.length} </span> {_l('个用户')}
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
        <div className="textPrimary">
          {_l('您共勾选了')} <span className="colorPrimary"> {selectedAccountIds.length} </span>
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
      noDepartmentUsers,
      removeUserFromSet = () => {},
      authority = [],
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
                className="InlineBlock textTertiary Font12 TxtMiddle LineHeight24 noDepartment"
                defaultChecked={typeCursor === 1}
                checked={noDepartmentUsers}
                onClick={checked => {
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
                <div
                  className="actBtn primaryBtn"
                  onClick={() => checkCertification({ projectId, checkSuccess: this.addUser })}
                >
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
                  {_l('编辑')}
                </div>
                <BatchResign
                  projectId={projectId}
                  selectedAccountIds={selectedAccountIds}
                  loadData={this.loadData}
                  updateSelectedAccountIds={this.props.updateSelectedAccountIds}
                />
              </Fragment>
            ) : typeCursor === 2 ? (
              <Fragment>
                <div
                  className={cx('actBtn', { disabledBtn: _.isEmpty(selectedAccountIds) })}
                  onClick={
                    _.isEmpty(selectedAccountIds)
                      ? () => {}
                      : () => checkCertification({ projectId, checkSuccess: this.reInvite })
                  }
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
          {typeCursor === 3 ? (
            <ApprovalContent projectId={projectId} {...this.props} />
          ) : (
            <UserTable projectId={projectId} authority={authority} />
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
            addUserVisible={openChangeUserInfoDrawer}
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
            authority={authority}
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
      projectId,
      typeNum,
      typeCursor,
      selectedAccountIds,
      isSelectAll,
      approveNumber,
      userStatus,
      noDepartmentUsers,
    } = current;
    const { departments } = state.entities;
    let departmentInfos = departments[departmentId];
    return {
      typeNum,
      typeCursor,
      selectedAccountIds,
      departmentId,
      projectId,
      isSearch: userList && userList.isSearchResult,
      allCount: userList && userList.allCount,
      pageIndex: userList && userList.pageIndex,
      pageSize: userList && userList.pageSize,
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
          'updateApplyDateOrderBy',
        ]),
      },
      dispatch,
    ),
)(StructureContent);
