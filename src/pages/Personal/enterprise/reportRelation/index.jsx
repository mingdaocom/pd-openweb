import React, { Component } from 'react';
import { Icon, LoadDiv } from 'ming-ui';
import structureController from 'src/api/structure';
import projectSettingController from 'src/api/projectSetting';
import roleController from 'src/api/role';
import Relation from 'src/pages/Admin/reportRelation';
import cx from 'classnames';
import Confirm from 'confirm';
import './index.less';
import { navigateTo } from 'router/navigateTo';
import { getRequest } from 'src/util';

const barList = [
  { label: _l('我的汇报关系'), key: 'report' },
  { label: _l('组织汇报关系'), key: 'enterprise' },
];

export default class ReportRelation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeBar: 'report',
      isAdmin: false,
      companyName: '',
      allowStructureSelfEdit: false,
      allowStructureForAll: false,
      parents: [],
      me: {},
      children: [],
      loading: false,
      projectId: getRequest().projectId
    };
  }

  componentDidMount() {
    this.init();
  }

  init() {
    this.setState({ loading: true });
    let companyName = '';
    _.every(md.global.Account.projects, p => {
      if (p.projectId === this.state.projectId) {
        companyName = p.companyName;
      }
    });

    $.when(this.fetchAdmin(), this.fetchAllow(), this.fetchParent(), this.fetchSubordinates()).then(
      (isAdmin, res, parents, accounts) => {
        if (accounts && accounts.length) {
          const me = _.find(accounts, ({ accountId }) => accountId === md.global.Account.accountId);
          this.setState({
            companyName,
            isAdmin,
            allowStructureForAll: res.allowStructureForAll,
            allowStructureSelfEdit: res.allowStructureSelfEdit,
            parents,
            me,
            children: me.subordinates,
            loading: false,
          });
        } else {
          alert(_l('获取失败', 2));
        }
      },
    );
  }

  fetchRender() {
    $.when(this.fetchParent(), this.fetchSubordinates()).then((parents, accounts) => {
      if (accounts && accounts.length) {
        const me = _.find(accounts, ({ accountId }) => accountId === md.global.Account.accountId);
        this.setState({
          parents,
          me,
          children: me.subordinates
        });
      } else {
        alert(_l('获取失败', 2));
      }
    })
  }

  //父级
  fetchParent() {
    return structureController.getParentsByAccountId({
      projectId: this.state.projectId,
      isDirect: true, // 直属
      accountId: md.global.Account.accountId,
    });
  }

  //子级
  fetchSubordinates() {
    return structureController.getSubordinateByAccountIds({
      projectId: this.state.projectId,
      isDirect: true, // 直属
      isGetParent: true,
      accountIds: [md.global.Account.accountId],
    });
  }

  //admin
  fetchAdmin() {
    return roleController.isProjectAdmin({
      projectId: this.state.projectId,
    });
  }

  //操作项
  fetchAllow() {
    return projectSettingController.getStructureForAll({
      projectId: this.state.projectId,
    });
  }

  handleChangeBar(value) {
    this.setState({ activeBar: value });
  }

  handleAddSub() {
    const { projectId } = this.state;
    const _this = this;
    require(['dialogSelectUser'], function() {
      var accountId = md.global.Account.accountId;
      var dialogSelectUserObj = $({}).dialogSelectUser({
        title: _l('添加下属'),
        showMoreInvite: false,
        SelectUserSettings: {
          projectId: projectId,
          filterAll: true,
          filterFriend: true,
          filterOthers: true,
          filterOtherProject: true,
          unique: false,
          showTabs: ['structureUsers'],
          extraTabs: [
            {
              id: 'structureUsers',
              name: '所有人',
              type: 4,
              page: true,
              actions: {
                getUsers: function(args) {
                  args = $.extend({}, args, {
                    accountId,
                    projectId: projectId,
                  });
                  return structureController.getAllowChooseUsers(args);
                },
              },
            },
          ],
          callback: function(accounts) {
            structureController
              .addStructure({
                accountIds: _.map(accounts, ({ accountId }) => accountId),
                parentId: accountId,
                isTop: false,
                projectId: projectId,
              })
              .then(function(res) {
                if (res && res.success) {
                  _this.fetchRender();
                } else {
                  alert(_l('操作失败', 2));
                }
              });
          },
        },
      });
    });
  }

  handleDelBtn({ accountId, fullname }) {
    const { projectId } = this.state;
    const _this = this;

    new Confirm(
      {
        title: _l('确认移除 %0 ?', fullname),
        content: '移除后，其下属成员也将从汇报关系中移除',
        cancel: _l('取消'),
        confirm: _l('确认'),
      },
      function() {
        structureController
          .removeParentID({
            accountId,
            projectId,
          })
          .then(function(res) {
            if (res) {
              _this.fetchRender();
            } else {
              alert(_l('操作失败', 2));
            }
          });
      },
    );
  }

  handleGoAdmin() {
    location.href = '/admin/reportRelation/' + this.state.projectId;
  }

  renderContent() {
    const { isAdmin, parents, me, children, allowStructureSelfEdit } = this.state;
    return (
      <div className="layoutWrapper">
        <div>
          <div className="listTitle">{_l('直属上级')}</div>
          <div className={cx('list parents', { hasAuth: isAdmin })}>
            {parents.length ? (
              this.renderList(parents)
            ) : (
              <div className="node Font16 LineHeight80 TxtCenter">{_l('没有配置上司')}</div>
            )}
          </div>
        </div>
        <div>
          <div className="mBottom40"></div>
          <div className="list">{this.renderBuildItem(me)}</div>
        </div>
        <div>
          <div className={cx("listTitle", { Hidden: !allowStructureSelfEdit&&!children.length})}>{_l('我的下属')}</div>
          <div className="list children">
            {children.length ? this.renderList(children) : null}
            {allowStructureSelfEdit && (
              <div className="node Font16 LineHeight80 Gray_bd addSub Hand" onClick={() => this.handleAddSub()}>
                <span className="Font24 mRight15 mLeft24 TxtMiddle icon-add-member2" />
                <span className="TxtMiddle">{_l('添加我的下属')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  renderList(list) {
    return list.map(item => {
      return this.renderBuildItem(item);
    });
  }

  renderBuildItem(param) {
    const { allowStructureSelfEdit } = this.state;
    const subordinates = param.subordinates || [];
    return (
      <div className={cx('node', param.status === 4 ? 'disabled' : 'ThemeHoverBorderColor3')}>
        <div className="userItem">
          <img src={param.avatar} className="avatar" />
          <div className="info">
            <div className="name">{param.fullname}</div>
            <div className="department">{param.department}</div>
            <div className="job">{param.job}</div>
          </div>
          {subordinates.length ? (
            <div className="subordinateCount">
              <span className="icon-charger Gray_a TxtMiddle Font14"></span>
              <span className="TxtMiddle Gray mLeft5">{subordinates.length}</span>
            </div>
          ) : null}
          {allowStructureSelfEdit ? (
            <span className="icon-close delBtn" onClick={() => this.handleDelBtn(param)}></span>
          ) : null}
        </div>
      </div>
    );
  }

  render() {
    const { allowStructureForAll, isAdmin, activeBar, loading } = this.state;
    if (loading) {
      return <LoadDiv />;
    }
    return (
      <div className="reportRelationEnterprise">
        <div className="reportHeader">
          <div className="headerIcon">
            <Icon
              icon="backspace"
              className="Hand mRight18 TxtMiddle Font24 Hover_49"
              onClick={() => navigateTo('/personal?type=enterprise')}
            ></Icon>
            <span className="Font17 Bold">{_l('我的汇报关系')}</span>
          </div>
          <div className={cx('headerOption', { Hidden: !allowStructureForAll })}>
            {barList.map(item => {
              return (
                <div
                  className={cx('headerOptionItem', { active: activeBar === item.key })}
                  key={item.key}
                  onClick={() => this.handleChangeBar(item.key)}
                >
                  {item.label}
                </div>
              );
            })}
          </div>
          <div>
            <span
              className={cx('ThemeColor3 Hand Hover_49', { Hidden: !isAdmin })}
              onClick={() => this.handleGoAdmin()}
            >
              {_l('去管理后台查看')}
            </span>
          </div>
        </div>
        <div className="reportContent">
          {activeBar === 'report' ? (
            this.renderContent()
          ) : (
            <Relation projectId={this.state.projectId} from={'myReport'} />
          )}
        </div>
      </div>
    );
  }
}
