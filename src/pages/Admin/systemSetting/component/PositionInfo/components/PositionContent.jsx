import React, { Component, Fragment } from 'react';
import { LoadDiv } from 'ming-ui';
import { Pagination } from 'antd';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as actions from '../../../../redux/position/action';
import RoleUserList from './RoleUserList';
import dialogUserBoard from 'src/pages/Admin/components/dialogUserBoard';
import dialogSelectUser from 'src/components/dialogSelectUser/dialogSelectUser';
import jobAjax from 'src/api/job';
import cx from 'classnames';
import _ from 'lodash';

const PAGE_SIZE = 50;

class PositionContent extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {}
  // 添加成员
  addUser = () => {
    const { projectId, currentPosition = {}, selectUserIds = [] } = this.props;
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
        jobAjax
          .addJobUser({
            projectId,
            jobId: currentPosition.jobId,
            accountIds: _.map(accountIds, user => user.accountId),
          })
          .then(data => {
            if (data) {
              this.props.getUserList({ jobId: currentPosition.jobId });
              alert(_l('添加成功'));
            } else alert(_l('添加失败'), 2);
          });
      },
    };
    dialogSelectUser({
      fromAdmin: true,
      SelectUserSettings: SelectUserSettingsForAdd,
    });
  };
  // 移除
  removeUsers = () => {
    const { selectUserIds = [], currentPosition = {}, projectId } = this.props;
    if (_.isEmpty(selectUserIds)) return;
    jobAjax
      .deleteJobUsers({
        projectId,
        accountIds: selectUserIds,
        jobId: currentPosition.jobId,
      })
      .then(res => {
        if (res) {
          this.props.getUserList({ jobId: currentPosition.jobId });
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
    const { currentPosition } = this.props;
    this.props.updateUserPageIndex(page);
    this.props.getUserList({ pageIndex: page, jobId: currentPosition.jobId });
  };
  render() {
    const { currentPosition, allUserCount, userPageIndex, userLoading, selectUserIds } = this.props;
    return (
      <Fragment>
        <div className="positionContentHeader Font15">
          <span className="Bold">{currentPosition.jobName}</span>
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
        <div className="userList">{userLoading ? <LoadDiv className="mTop30" /> : <RoleUserList />}</div>
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
    const { currentPosition, userList, allUserCount, userPageIndex, userLoading, selectUserIds, projectId } =
      state.orgManagePage.position;
    return { currentPosition, userList, allUserCount, userPageIndex, userLoading, selectUserIds, projectId };
  },
  dispatch =>
    bindActionCreators({ ..._.pick(actions, ['getUserList', 'updateUserPageIndex', 'updateSelectUserIds']) }, dispatch),
)(PositionContent);
