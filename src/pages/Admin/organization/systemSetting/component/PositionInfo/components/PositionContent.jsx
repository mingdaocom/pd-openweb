import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import _ from 'lodash';
import { LoadDiv } from 'ming-ui';
import { dialogSelectUser } from 'ming-ui/functions';
import jobAjax from 'src/api/job';
import PaginationWrap from 'src/pages/Admin/components/PaginationWrap';
import { dialogUserBoard } from 'src/pages/Admin/components/userBoardDialog';
import * as actions from '../../../../../redux/position/action';
import RoleUserList from './RoleUserList';

const PAGE_SIZE = 50;

class PositionContent extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {}
  // 添加成员
  addUser = () => {
    const { projectId, currentPosition = {} } = this.props;
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
    const { currentPosition } = this.props;
    this.props.updateUserPageIndex(page);
    this.props.getUserList({ pageIndex: page, jobId: currentPosition.jobId });
  };
  render() {
    const { currentPosition, allUserCount, userPageIndex, userLoading, selectUserIds, projectId } = this.props;
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
        <div className="userList">
          {userLoading ? <LoadDiv className="mTop30" /> : <RoleUserList projectId={projectId} />}
        </div>
        {!userLoading && allUserCount > PAGE_SIZE && (
          <PaginationWrap
            total={allUserCount}
            pageIndex={userPageIndex}
            pageSize={PAGE_SIZE}
            onChange={this.changPage}
          />
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
