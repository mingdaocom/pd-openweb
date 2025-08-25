import React, { Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Dialog, Icon, LoadDiv, SortableList } from 'ming-ui';
import account from 'src/api/account';
import accountSettingApi from 'src/api/accountSetting';
import { getRequest } from 'src/utils/common';
import { getCurrentProject } from 'src/utils/project';
import common from '../common';
import EnterpriseCard from './modules/EnterpriseCard';
import InvitationList from './modules/InvitationList';
import ReportRelation from './reportRelation';
import './index.less';

export default class AccountChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pageIndex: 1,
      pageSize: 500,
      unAuthList: [],
      list: [],
      count: 0,
      token: '',
      loading: false,
      isEnterprise: false,
      authCount: 0,
      dialog: {
        visible: false,
        data: null,
      },
      expandCloseProject: false,
    };
  }

  componentDidMount() {
    this.getData();
  }

  getData() {
    if (getRequest().type === 'enterprise') {
      this.setState({ loading: true });
      Promise.all([
        this.getList({ userStatus: common.USER_STATUS.UNAUDITED }),
        this.getList(),
        this.getUntreatAuthList(),
        this.getList({ projectStatus: 2 }),
      ]).then(([unAuthProject, project, auth, closeProject]) => {
        console.log(closeProject);
        this.setState({
          unAuthList: (unAuthProject.list || []).map(v => ({
            ...v,
            companyName: getCurrentProject(v.projectId).companyName || v.companyName,
          })),
          list: (project.list || []).map(v => ({
            ...v,
            companyName: getCurrentProject(v.projectId).companyName || v.companyName,
          })),
          count: project.allCount,
          isEnterprise: project.allCount > 0,
          authCount: auth.count,
          loading: false,
          closeProject,
        });
      });
    } else {
      this.setState({ isEnterprise: getRequest().type });
    }
  }

  //列表
  getList(param = { userStatus: 1 }) {
    return account.getProjectList({
      pageIndex: this.state.pageIndex,
      pageSize: this.state.pageSize,
      ...param,
    });
  }

  //邀请信息count数
  getUntreatAuthList() {
    return account.getUntreatAuthList({});
  }

  renderSortableList() {
    const { list } = this.state;
    return (
      <SortableList
        useDragHandle
        items={list}
        renderItem={({ item, DragHandle }) => (
          <EnterpriseCard DragHandle={DragHandle} card={item} getData={() => this.getData()} />
        )}
        itemKey="projectId"
        helperClass="projectCardSortHelper"
        onSortEnd={newItems => {
          const sortedProjectIds = newItems.map(item => item.projectId);
          this.setState({ list: sortedProjectIds.map(projectId => _.find(list, { projectId })) });
          accountSettingApi.editJoinedProjectSort({ projectIds: sortedProjectIds }).then(res => {
            res &&
              (md.global.Account.projects = sortedProjectIds
                .map(projectId => _.find(md.global.Account.projects, { projectId }))
                .filter(item => item));
          });
        }}
      />
    );
  }

  handleAdd() {
    location.href = '/enterpriseRegister?type=add';
  }

  //我的邀请
  handleInvitation() {
    account
      .getMyAuthList({})
      .then(data => {
        if (data.list) {
          this.setState({ dialog: { visible: true, data: data.list } });
        } else {
          alert(_l('操作失败'), 2);
        }
      })
      .catch();
  }

  existUserNotice(status) {
    switch (status) {
      case 1:
        alert(_l('您已是该组织成员'), 3);
        break;
      case 2:
        alert(_l('您已被该组织拒绝加入'), 3);
        break;
      case 3:
        alert(_l('您已是该组织成员，请等待审批'), 3);
        break;
      case 4:
        alert(_l('您已从该组织退出，需联系该组织的组织管理员进行恢复'), 3);
        break;
      default:
        alert(_l('您已是该组织的成员'), 3);
    }
  }

  //创建
  handleCreate() {
    if (
      md.global.Account.superAdmin ||
      (md.global.Config.IsPlatformLocal && md.global.SysSettings.enableCreateProject)
    ) {
      window.open('/enterpriseRegister?type=create');
    } else {
      alert('权限不足，无法创建组织', 3);
    }
  }

  renderContent() {
    const { authCount, unAuthList, closeProject, expandCloseProject } = this.state;
    if (getRequest().type === 'enterprise') {
      return (
        <div className="enterpriceContainer">
          <div className="enterpriseHeader">
            <div className="Gray Font17 Bold">{_l('我的组织')}</div>
            <div className="flexRow">
              <div
                className="Gray_75 Font14 Hand Relative LineHeight32 mRight40"
                onClick={() => this.handleInvitation()}
              >
                <span className="hover_blue">{_l('我的受邀信息')}</span>
                <span className={cx('invitationNew', { Hidden: !authCount })}>{authCount}</span>
              </div>
              {(!md.global.Config.IsLocal ||
                md.global.Account.superAdmin ||
                md.global.SysSettings.enableCreateProject) && (
                <div className="Font14 Hand itemCreat" onClick={() => this.handleCreate()}>
                  {_l('创建组织')}
                </div>
              )}
              <button
                type="button"
                className="ming Button Button--primary itemJoin mLeft30"
                onClick={() => this.handleAdd()}
              >
                {_l('加入组织')}
              </button>
            </div>
          </div>
          <div className="enterpriseContent">
            {!!unAuthList.length && (
              <React.Fragment>
                <div className="groupTitle mTop0">{_l('待审核')}</div>
                {unAuthList.map((item, index) => (
                  <EnterpriseCard key={index} card={item} getData={() => this.getData()} />
                ))}
                <div className="groupTitle">{_l('已加入')}</div>
              </React.Fragment>
            )}
            {this.renderSortableList()}
            {!_.isEmpty(closeProject) && (
              <Fragment>
                <div
                  className="Gray_75 Font14 Hand mBottom13 Hover_21"
                  onClick={() => this.setState({ expandCloseProject: !expandCloseProject })}
                >
                  {_l('已关闭 %0', closeProject.allCount)}
                  <Icon icon={expandCloseProject ? 'arrow-up-border' : 'arrow-up-border1'} className="mLeft10" />
                </div>
                {expandCloseProject &&
                  closeProject.list.map(item => (
                    <EnterpriseCard
                      key={`close-project-${item.projectId}`}
                      card={item}
                      isClose={true}
                      getData={() => this.getData()}
                    />
                  ))}
              </Fragment>
            )}
          </div>
        </div>
      );
    } else {
      return <ReportRelation />;
    }
  }

  render() {
    const { loading, isEnterprise, authCount, dialog } = this.state;
    if (loading) {
      return <LoadDiv className="mTop40" />;
    }
    return (
      <Fragment>
        {isEnterprise ? (
          this.renderContent()
        ) : (
          <div className="noEnterpriceContainer">
            <div className="withoutEnterpriseHeader">
              <span className="Font17 Gray Bold">{_l('我的组织')}</span>
              <span>
                <span
                  className="Hand MyInvitation Relative LineHeight30 Fong14"
                  onClick={() => this.handleInvitation()}
                >
                  {_l('我的受邀信息')}
                  <span className={cx('invitationNew', { Hidden: !authCount })}>
                    {authCount > 99 ? '99+' : authCount}
                  </span>
                </span>
                <span
                  className="Font14 Hand mLeft40 mRight30 itemCreat InlineBlock"
                  onClick={() => this.handleCreate()}
                >
                  {_l('创建组织')}
                </span>
                <span className="addBtn Hand" onClick={() => this.handleAdd()}>
                  {_l('加入组织')}
                </span>
              </span>
            </div>
            <div className="withoutEnterpriseTopBox TxtCenter clearfix">
              <span className="icon-business mBottom40 Font56"></span>
              <span>
                {_l('您还没有加入任何组织，请')}
                <span className="Hand mLeft5 mRight5 highLight InlineBlock" onClick={() => this.handleCreate()}>
                  {_l('创建')}
                </span>
                {_l('或')}
                <span className="Hand mLeft5 highLight InlineBlock" onClick={() => this.handleAdd()}>
                  {_l('加入组织')}
                </span>
              </span>
            </div>
          </div>
        )}
        <Dialog
          showFooter={false}
          visible={dialog.visible}
          onCancel={() => this.setState({ dialog: { visible: false, data: null } })}
        >
          <InvitationList
            list={dialog.data}
            updateAuthCount={() => this.setState({ authCount: this.state.authCount - 1 })}
            existUserNotice={this.existUserNotice}
            closeDialog={() => this.setState({ dialog: { visible: false, data: null } })}
          />
        </Dialog>
      </Fragment>
    );
  }
}
