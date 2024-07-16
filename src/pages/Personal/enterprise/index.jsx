import React, { Fragment } from 'react';
import account from 'src/api/account';
import { LoadDiv, Dialog } from 'ming-ui';
import EnterpriseCard from './modules/EnterpriseCard';
import cx from 'classnames';
import InvitationList from './modules/InvitationList';
import { validateFunc } from '../components/ValidateInfo';
import './index.less';
import ReportRelation from './reportRelation';
import { getRequest, getCurrentProject } from 'src/util';
import registerAjax from 'src/api/register';
import { upgradeVersionDialog } from 'src/util';
import _ from 'lodash';

export default class AccountChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pageIndex: 1,
      pageSize: 500,
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
    };
  }

  componentDidMount() {
    this.getData();
  }

  getData() {
    if (getRequest().type === 'enterprise') {
      this.setState({ loading: true });
      Promise.all([this.getList(), this.getUntreatAuthList()]).then(([project, auth]) => {
        this.setState({
          list: (project.list || []).map(v => {
            return {
              ...v,
              companyName: getCurrentProject(v.projectId).companyName || v.companyName,
            };
          }),
          count: project.allCount,
          isEnterprise: project.allCount > 0,
          authCount: auth.count,
          loading: false,
        });
      });
    } else {
      this.setState({ isEnterprise: getRequest().type });
    }
  }

  //列表
  getList() {
    return account.getProjectList({
      pageIndex: this.state.pageIndex,
      pageSize: this.state.pageSize,
    });
  }

  //邀请信息count数
  getUntreatAuthList() {
    return account.getUntreatAuthList({});
  }

  renderListCard() {
    const { list } = this.state;
    return (
      <Fragment>
        {list &&
          list.map(card => {
            return <EnterpriseCard card={card} key={card.projectId} getData={() => this.getData()} />;
          })}
      </Fragment>
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
    if ((md.global.Account.superAdmin || (md.global.Config.IsPlatformLocal && md.global.SysSettings.enableCreateProject))) {
      window.open('/enterpriseRegister?type=create');
    } else {
      alert('权限不足，无法创建组织', 3);
    }
  }

  renderContent() {
    const { authCount } = this.state;
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
          <div className="enterpriseContent">{this.renderListCard()}</div>
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
              <span className="icon-business1 mBottom40 Font56"></span>
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
