import React, { Component, Fragment } from 'react';
import { LoadDiv } from 'ming-ui';
import { Pagination } from 'antd';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as actions from '../../redux/roleManage/action';
import RoleUserList from './RoleUserList';
import dialogUserBoard from '../../structure/modules/dialogUserBoard';
import dialogSelectUser from 'src/components/dialogSelectUser/dialogSelectUser';
import organizeAjax from 'src/api/organize.js';
import cx from 'classnames';
import _ from 'lodash';

const PAGE_SIZE = 50;

class RoleManageContent extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {}
  // 添加成员
  addUser = () => {
    const { projectId, currentRole = {}, selectUserIds = [] } = this.props;
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
    const _this = this;
    if (_.isEmpty(selectUserIds)) return;
    dialogUserBoard({
      type: 'export',
      projectId,
      accountIds: selectUserIds,
      yesFn() {
        _this.props.updateSelectUserIds([]); //清空所选
      },
      noFn() {
        _this.props.updateSelectUserIds([]); //清空所选
      },
    });
  };
  itemRender(current, type, originalElement) {
    if (type === 'prev') {
      return <a className="page">{_l('上一页')}</a>;
    }
    if (type === 'next') {
      return <a className="page">{_l('下一页')}</a>;
    }
    return originalElement;
  }
  // 分页
  changPage = page => {
    const { currentRole } = this.props;
    this.props.updateUserPageIndex(page);
    this.props.getUserList({ pageIndex: page, roleId: currentRole.organizeId });
  };
  render() {
    const { currentRole, allUserCount, userPageIndex, userLoading, selectUserIds, userList } = this.props;
    return (
      <Fragment>
        <div className="roleContentHeader Font15">
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
              userList={userList}
              selectUserIds={selectUserIds}
              updateSelectUserIds={this.props.updateSelectUserIds}
            />
          )}
        </div>
        {!userLoading && allUserCount > PAGE_SIZE && (
          <div className="pagination">
            <Pagination
              total={allUserCount}
              itemRender={this.itemRender}
              onChange={this.changPage}
              current={userPageIndex}
              pageSize={50}
            />
          </div>
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
