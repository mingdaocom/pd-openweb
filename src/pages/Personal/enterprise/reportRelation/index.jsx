import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { navigateTo } from 'router/navigateTo';
import { Dialog, Icon, LoadDiv } from 'ming-ui';
import { dialogSelectUser } from 'ming-ui/functions';
import projectSettingController from 'src/api/projectSetting';
import roleController from 'src/api/role';
import structureController from 'src/api/structure';
import { hasBackStageAdminAuth } from 'src/components/checkPermission';
import Relation from 'src/pages/Admin/user/reportRelation';
import { getRequest } from 'src/utils/common';
import './index.less';

const barList = [
  { label: _l('我的汇报关系'), key: 'report' },
  { label: _l('组织汇报关系'), key: 'enterprise' },
];

export default class ReportRelation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeBar: 'report',
      hasProjectAdminAuth: false,
      companyName: '',
      allowStructureSelfEdit: false,
      allowStructureForAll: false,
      parents: [],
      me: {},
      children: [],
      loading: false,
      pageIndex: 1,
      projectId: getRequest().projectId,
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

    Promise.all([this.fetchAllow(), this.fetchSubordinates()]).then(
      ([res, { parent = {}, mySelf = {}, subordinates = [], subTotalCount, isLimited }]) => {
        const hasProjectAdminAuth = hasBackStageAdminAuth({ projectId: this.state.projectId });

        if (!_.isEmpty(mySelf) && this.state.pageIndex === 1) {
          this.setState({
            companyName,
            hasProjectAdminAuth,
            allowStructureForAll: res.allowStructureForAll,
            allowStructureSelfEdit: res.allowStructureSelfEdit,
            parents: !_.isEmpty(parent) ? [parent] : [],
            me: mySelf,
            children: subordinates,
            loading: false,
            subTotalCount,
            isLimited,
          });
        } else {
          alert(_l('获取失败'), 2);
        }
      },
    );
  }

  fetchRender(pageIndex) {
    this.fetchSubordinates(pageIndex).then(({ parent = {}, mySelf = {}, subordinates = [], subTotalCount }) => {
      if (!_.isEmpty(mySelf) && pageIndex === 1) {
        this.setState({
          parent,
          me: mySelf,
          children: subordinates,
          subTotalCount,
        });
      } else {
        alert(_l('获取失败'), 2);
      }
    });
  }

  //子级
  fetchSubordinates(pageIndex = 1) {
    return structureController.myStructures({
      projectId: this.state.projectId,
      pageIndex,
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
    var accountId = md.global.Account.accountId;
    dialogSelectUser({
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
              getUsers: function (args) {
                args = $.extend({}, args, {
                  accountId,
                  projectId: projectId,
                });
                return structureController.getAllowChooseUsers(args);
              },
            },
          },
        ],
        callback: function (accounts) {
          structureController
            .addStructure({
              accountIds: _.map(accounts, ({ accountId }) => accountId),
              parentId: accountId,
              isTop: false,
              projectId: projectId,
            })
            .then(function (res) {
              if (res && res.success) {
                _this.fetchRender(1);
              } else {
                alert(_l('操作失败'), 2);
              }
            });
        },
      },
    });
  }

  handleDelBtn({ accountId, fullname }) {
    const { projectId } = this.state;
    const _this = this;

    Dialog.confirm({
      title: _l('确认移除 %0 ?', fullname),
      description: _l('移除后，其下属成员也将从汇报关系中移除'),
      onOk: () => {
        structureController
          .removeParentID({
            accountId,
            projectId,
          })
          .then(function (res) {
            if (res) {
              _this.setState({ pageIndex: 1 });
              _this.fetchRender(1);
            } else {
              alert(_l('操作失败'), 2);
            }
          });
      },
    });
  }

  handleGoAdmin() {
    location.href = '/admin/reportRelation/' + this.state.projectId;
  }

  renderContent() {
    const { parents, me, children, allowStructureSelfEdit, subTotalCount, loadMoreLoading, isLimited } = this.state;
    return (
      <div className="layoutWrapper">
        <div>
          <div className="listTitle">{_l('直属上级')}</div>
          <div className={cx('list parents')}>
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
          <div className={cx('listTitle', { Hidden: !allowStructureSelfEdit && !children.length })}>
            {_l('我的下属')}
          </div>
          <div className="list children">
            {children.length ? this.renderList(children) : null}
            {allowStructureSelfEdit && !isLimited && (
              <div className="node Font16 LineHeight80 Gray_bd addSub Hand" onClick={() => this.handleAddSub()}>
                <span className="Font24 mRight15 mLeft24 TxtMiddle icon-add-member2" />
                <span className="TxtMiddle">{_l('添加我的下属')}</span>
              </div>
            )}
            {subTotalCount > children.length && (
              <div
                className="Hand loadMore"
                onClick={() => {
                  if (loadMoreLoading) return;
                  this.setState({ pageIndex: this.state.pageIndex + 1, loadMoreLoading: true }, () => {
                    this.fetchSubordinates(this.state.pageIndex).then(({ subordinates = [] }) => {
                      this.setState({ children: this.state.children.concat(subordinates), loadMoreLoading: false });
                    });
                  });
                }}
              >
                {loadMoreLoading ? _l('加载中') : _l('更多')}
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
    const { allowStructureSelfEdit, subTotalCount } = this.state;
    return (
      <div className={cx('node', param.status === 4 ? 'disabled' : 'ThemeHoverBorderColor3')}>
        <div className="userItem">
          <img src={param.avatar} className="avatar" />
          <div className="info">
            <div className="name">{param.fullname}</div>
            <div className="department">{param.department}</div>
            <div className="job">{param.job}</div>
          </div>
          {param.accountId === md.global.Account.accountId && subTotalCount ? (
            <div className="subordinateCount">
              <span className="icon-charger Gray_a TxtMiddle Font14"></span>
              <span className="TxtMiddle Gray mLeft5">{subTotalCount}</span>
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
    const { allowStructureForAll, hasProjectAdminAuth, activeBar, loading } = this.state;
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
              className={cx('ThemeColor3 Hand Hover_49', { Hidden: !hasProjectAdminAuth })}
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
