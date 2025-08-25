import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import _ from 'lodash';
import { LoadDiv } from 'ming-ui';
import { dialogSelectUser } from 'ming-ui/functions';
import organizeAjax from 'src/api/organize.js';
import { dialogUserBoard } from 'src/pages/Admin/components/userBoardDialog';
import PaginationWrap from '../../../components/PaginationWrap';
import * as actions from '../../../redux/roleManage/action';
import RoleUserList from './RoleUserList';

const PAGE_SIZE = 50;

class RoleManageContent extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {}
  // 添加成员
  addUser = () => {
    const { projectId, currentRole = {} } = this.props;
    const SelectUserSettingsForAdd = {
      unique: false,
      projectId: projectId,
      filterAll: true,
      filterFriend: true,
      filterOthers: true,
      filterOtherProject: true,
      dataRange: 2,
      callback: accountIds => {
        //添加到职位
        organizeAjax
          .addOrganizeUsers({
            projectId,
            organizeId: currentRole.organizeId,
            filterResigned: false,
            accountIds: _.map(accountIds, user => user.accountId),
          })
          .then(data => {
            if (data) {
              this.props.getUserList({ roleId: currentRole.organizeId });
              alert(_l('添加成功'));
            } else alert(_l('添加失败'), 2);
          });
      },
    };
    dialogSelectUser({
      showMoreInvite: false,
      fromAdmin: true,
      SelectUserSettings: SelectUserSettingsForAdd,
    });
  };
  // 移除
  removeUsers = () => {
    const { selectUserIds = [], currentRole = {}, projectId } = this.props;
    if (_.isEmpty(selectUserIds)) return;
    organizeAjax
      .deleteOrganizeUsers({
        projectId,
        accountIds: selectUserIds,
        organizeId: currentRole.organizeId,
      })
      .then(res => {
        if (res) {
          this.props.getUserList({ roleId: currentRole.organizeId });
          this.props.updateSelectUserIds([]);
          alert(_l('移出成功'));
        } else {
          alert(_l('移除失败'), 2);
        }
      });
  };
  // 导出
  handleExportUser = () => {
    const { projectId, selectUserIds = [] } = this.props;
    if (_.isEmpty(selectUserIds)) return;

    dialogUserBoard({
      projectId,
      accountIds: selectUserIds,
      updateSelectUserIds: () => {
        this.props.updateSelectUserIds([]);
      },
    });
  };
  // 分页
  changPage = page => {
    const { currentRole } = this.props;
    this.props.updateUserPageIndex(page);
    this.props.getUserList({ pageIndex: page, roleId: currentRole.organizeId });
  };
  render() {
    const { currentRole, allUserCount, userPageIndex, userLoading, selectUserIds, userList, projectId } = this.props;
    return (
      <Fragment>
        <div className="roleContentHeader Font17">
          <span className="Bold">{currentRole.organizeName}</span>
          {allUserCount ? <span className="Gray_9e mLeft10">{allUserCount}</span> : ''}
        </div>
        <div className="actUserBox">
          <div className="actBtn addUser Hand" onClick={this.addUser}>
            {_l('添加成员')}
          </div>
          <div className={cx('actBtn', { disabledBtn: _.isEmpty(selectUserIds) })} onClick={this.removeUsers}>
            {_l('移出')}
          </div>
          <div className={cx('actBtn', { disabledBtn: _.isEmpty(selectUserIds) })} onClick={this.handleExportUser}>
            {_l('导出')}
          </div>
        </div>
        <div className="userList">
          {userLoading ? (
            <LoadDiv className="mTop30" />
          ) : (
            <RoleUserList
              projectId={projectId}
              roleId={currentRole.organizeId}
              userList={userList}
              selectUserIds={selectUserIds}
              updateSelectUserIds={this.props.updateSelectUserIds}
              updateUerList={() => this.props.getUserList({ pageIndex: userPageIndex, roleId: currentRole.organizeId })}
            />
          )}
        </div>
        {!userLoading && allUserCount > PAGE_SIZE && (
          <PaginationWrap
            total={allUserCount}
            pageSize={PAGE_SIZE}
            pageIndex={userPageIndex}
            onChange={this.changPage}
          />
        )}
      </Fragment>
    );
  }
}

export default connect(
  state => {
    const { currentRole, userList, allUserCount, userPageIndex, userLoading, selectUserIds, projectId } =
      state.orgManagePage.roleManage;
    return { currentRole, userList, allUserCount, userPageIndex, userLoading, selectUserIds, projectId };
  },
  dispatch =>
    bindActionCreators({ ..._.pick(actions, ['getUserList', 'updateUserPageIndex', 'updateSelectUserIds']) }, dispatch),
)(RoleManageContent);
