import React, { Component } from 'react';
import { connect } from 'react-redux';
import { emptyUserSet, fetchApproval, fetchInActive } from '../../actions/current';
import dialogInviteUser from '../../modules/dialogInviteUser';
import userBoard from '../../modules/dialogUserBoard';
import * as Invite from 'src/components/common/inviteMember/inviteMember';
import { Icon } from 'ming-ui';
import MoreActionDia from './moreActionDia';
import DialogLayer from 'mdDialog';
import ReactDom from 'react-dom';
import ImportUser from '../../modules/dialogImportUser';

class ToolBar extends Component {
  constructor(props) {
    super(props);
    const { dispatch, projectId } = props;
    this.state = {
      showMoreAction: false,
    };
    dispatch(fetchApproval(projectId));
    dispatch(fetchInActive(projectId));
  }

  componentDidMount() {
    if(this.props.autoImport) {
      setTimeout(() => {
        this.importUser()
      }, 1000)
    }
  }

  renderApproval() {
    const { approveNumber, inActiveNumber, projectId } = this.props;
    return (
      <div className="Right mTop6">
        <a href={'/admin/approve/' + projectId} className="ThemeColor3 Hand mRight15">
          {_l(inActiveNumber ? '待管理员审核(%0)' : '待管理员审核', inActiveNumber)}
        </a>
        {approveNumber > 0 ? (
          <span
            className="ThemeColor3 Hand tip-bottom-left"
            data-tip={_l('已被邀请但未正式加入的用户')}
            onClick={this.openApproval.bind(this)}>
            {_l('未激活用户(%0)', approveNumber)}
          </span>
        ) : null}
      </div>
    );
  }

  openApproval() {
    const { projectId, dispatch } = this.props;
    userBoard({
      type: 'inActive',
      projectId,
      callback() {
        dispatch(fetchApproval(projectId));
      },
    });
  }

  inviteUser = () => {
    const { projectId, dispatch, jobInfos, departmentInfos, departmentId, typeNum } = this.props;
    dialogInviteUser({
      jobInfos: typeNum === 0 ? [] : jobInfos,
      departmentInfos: !departmentId || typeNum !== 0 ? '' : departmentInfos,
      projectId,
      callback() {
        dispatch(fetchApproval(projectId));
      },
    });
  };

  inviteMore = () => {
    const { projectId } = this.props;
    require(['mdDialog', 'chooseInvite'], dialogCreator => {
      var dialog = dialogCreator.index({
        dialogBoxID: 'inviteUser' + projectId,
        width: 500,
        container: {
          header: _l('添加成员'),
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

  importUser = () => {
    const options = {
      container: {
        content: '',
        yesText: null,
        noText: null,
        header: _l('批量导入'),
      },
      dialogBoxID: 'importUserDialogId',
      width: '680',
    };
    ReactDom.render(
      <DialogLayer {...options}>
        <ImportUser
          closeDialog={() => {
            $('#importUserDialogId_container,#importUserDialogId_mask').remove();
          }}
        />
      </DialogLayer>,
      document.createElement('div'),
    );
  };

  handleExportUser = () => {
    const { projectId, dispatch } = this.props;
    userBoard({
      type: 'export',
      projectId,
      accountIds: [],
      noFn() {
        dispatch(emptyUserSet());
      },
    });
  };

  render() {
    return (
      <div className="toolRight">
        <span
          className="addMenberBtn"
          onClick={e => {
            this.inviteUser();
          }}>
          <Icon className="Font16 mRight8" icon="add" />
          {_l('添加成员')}
        </span>
        <span
          className="moreAction mLeft8"
          onClick={() => {
            this.setState({
              showMoreAction: !this.state.showMoreAction,
            });
          }}>
          <Icon className="Font16 LineHeight32" icon="more_horiz" />
          {/* 更多邀请/批量导入/导出通讯录 */}
          {this.state.showMoreAction && (
            <MoreActionDia
              onClickAway={() =>
                this.setState({
                  showMoreAction: false,
                })
              }
              showMoreAction={this.state.showMoreAction}
              inviteMore={this.inviteMore}
              importUser={this.importUser}
              handleExportUser={this.handleExportUser}
            />
          )}
        </span>
      </div>
    );
  }
}

const mapStateToProps = state => {
  const {
    current: { departmentId, projectId, selectedAccountIds, approveNumber, inActiveNumber, isSearch, typeNum, autoImport },
    jobs: { jobId, jobList = [] },
    pagination,
    entities: { departments = [] },
  } = state;
  let departmentInfos = departments[departmentId];
  let jobInfos = jobList.filter(it => it.jobId === jobId);
  return {
    pagination,
    projectId,
    departmentId,
    selectedAccountIds,
    selectCount: selectedAccountIds.length,
    approveNumber,
    inActiveNumber,
    isSearch,
    jobInfos,
    departmentInfos,
    typeNum,
    autoImport
  };
};

export default connect(mapStateToProps)(ToolBar);
