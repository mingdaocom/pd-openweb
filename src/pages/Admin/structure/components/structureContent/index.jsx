import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { LoadDiv, Checkbox } from 'ming-ui';
import * as entitiesActions from '../../actions/entities';
import * as currentActions from '../../actions/current';
import * as Invite from 'src/components/common/inviteMember/inviteMember';
import dialogInviteUser from '../../modules/dialogInviteUser';
import DialogBatchEdit from '../../modules/dialogBatchEdit';
import UserTable from '../userList/userTable';
import JopList from '../userList/jobList';
import RoleController from 'src/api/role';
import { encrypt } from 'src/util';
import cx from 'classnames';
import { Pagination } from 'antd';
import { batchResetPassword } from 'src/api/user';

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
    const { allCount, departmentId, jobInfos } = this.props;
    return typeof allCount !== 'undefined' ? (
      <span className={cx('color_9e mLeft5 mRight15', { TxtMiddle: departmentId })}>{allCount}</span>
    ) : null;
  }
  // ????????????
  addUser = () => {
    const { projectId, jobInfos, departmentInfos, departmentId, typeNum } = this.props;
    let _this = this;
    dialogInviteUser({
      jobInfos: typeNum === 0 ? [] : jobInfos,
      departmentInfos: !departmentId || typeNum !== 0 ? '' : departmentInfos,
      projectId,
      callback() {
        _this.props.fetchApproval(projectId);
      },
    });
  };
  // ????????????
  inviteMore = () => {
    const { projectId } = this.props;
    require(['mdDialog', 'chooseInvite'], dialogCreator => {
      var dialog = dialogCreator.index({
        dialogBoxID: 'inviteUser' + projectId,
        width: 500,
        container: {
          header: _l('????????????'),
          content: '<div class="chooseInviteContainer pBottom50"></div>',
          yesText: '',
          noText: '',
        },
        readyFn() {
          $('#inviteUser' + projectId)
            .find('.chooseInviteContainer')
            .chooseInvite({
              projectId: projectId,
              sourceId: projectId,
              fromType: 4,
              callback(data, callbackInviteResult) {
                Invite.inviteByAccounts(projectId, data, callbackInviteResult);
              },
            });
        },
      });
    });
  };
  // ????????????
  exportInAndOut = () => {
    this.props.updateShowExport(true);
  };
  //  ????????????
  batchEdit = () => {
    this.setState({ batchEditVisible: true });
  };

  itemRender(current, type, originalElement) {
    if (type === 'prev') {
      return <a className="page">{_l('?????????')}</a>;
    }
    if (type === 'next') {
      return <a className="page">{_l('?????????')}</a>;
    }
    return originalElement;
  }

  // ??????
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
      typeCursor = 0,
      selectedAccountIds = [],
      departmentName,
      pageSize,
      isSelectAll,
      isLoading,
      removeUserFromSet = () => {},
    } = this.props;
    let { batchEditVisible } = this.state;
    if (typeNum === 0) {
      //????????????
      return (
        <Fragment>
          {!isSearch ? (
            <div className="Font15 departmentTitle">
              <span className="departmentNameValue" title={!!departmentId && departmentName}>
                {!!departmentId && departmentName}
              </span>
              {(typeCursor === 0 || typeCursor === 1) && !departmentId && _l('?????????')}
              {typeCursor === 2 && _l('?????????')}
              {typeCursor === 3 && _l('?????????')}
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
                  {_l('?????????????????????')}
                </Checkbox>
              )}
            </div>
          ) : (
            ''
          )}
          {(typeCursor === 0 || departmentId) && (
            <div className="actList flexRow">
              <div className="actBtn" onClick={this.addUser}>
                {_l('????????????')}
              </div>
              <div className="actBtn" onClick={this.inviteMore}>
                {_l('????????????')}
              </div>
              <div className="actBtn" onClick={this.exportInAndOut}>
                {_l('?????? / ?????? / ??????')}
              </div>
              <div
                className={cx('actBtn', { disabledBtn: _.isEmpty(selectedAccountIds) })}
                onClick={_.isEmpty(selectedAccountIds) ? () => {} : this.batchEdit}
              >
                {_l('????????????')}
              </div>
            </div>
          )}
          <div className="listInfo">
            {isLoading ? (
              <div className="laodingContainer">
                <LoadDiv />
              </div>
            ) : (
              <UserTable />
            )}
            {allCount > pageSize && (
              <div className="pagination">
                <Pagination
                  total={allCount}
                  itemRender={this.itemRender}
                  onChange={this.changPage}
                  current={pageIndex}
                  pageSize={pageSize || 50}
                />
              </div>
            )}
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
        </Fragment>
      );
    } else {
      //????????????
      return <JopList />;
    }
  }
}

export default connect(
  state => {
    const {
      current,
      pagination: { userList = [] },
      jobs: { jobId, jobList = [] },
    } = state;
    const { departmentId, root, projectId, typeNum, typeCursor, selectedAccountIds, isSelectAll } = current;
    const isRoot = departmentId === root;
    const { departments } = state.entities;
    let departmentInfos = departments[departmentId];
    let jobInfos = jobList.filter(it => it.jobId === jobId);
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
      jobInfos,
      departmentInfos,
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
        ]),
      },
      dispatch,
    ),
)(StructureContent);
