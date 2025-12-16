import React, { Component } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import { UserHead } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import withClickAway from 'ming-ui/decorators/withClickAway';
import { dialogSelectUser } from 'ming-ui/functions';
import ajaxRequest from 'src/api/taskCenter';
import { upgradeVersionDialog } from 'src/components/upgradeVersion';
import { navigateTo } from 'src/router/navigateTo';
import { updateStateConfig } from '../../../../redux/actions';
import config from '../../config/config';
import { addFollowMembers, removeFollowMembers, updateUserStatus } from '../../redux/actions';
import './subordinateMembers.less';

const ClickAwayable = createDecoratedComponent(withClickAway);

class SubordinateMembers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showNetwork: false,
    };
  }

  componentDidMount() {
    // 竖着滚动对应右侧竖着滚动
    $(this.ganttMembersList).on({
      mouseover() {
        config.scrollSelector = $(this);
      },
      scroll() {
        if (config.scrollSelector && !config.scrollSelector.is($('.ganttMain .timeBarContainer'))) {
          $('.ganttMain .timeBarContainer').scrollTop(this.scrollTop);
        }
      },
    });
  }

  /**
   * 切换网络
   * @param  {string} projectId
   */
  switchNetwork(projectId) {
    this.setState({ showNetwork: false });
    this.props.getSetting(projectId);
  }

  /**
   * 检查是左键点击
   * @param  {object} evt
   */
  checkMouseDownIsLeft(evt) {
    return evt.button === 0;
  }

  /**
   * 无下属和关注的同事的时候的样式
   */
  ganttSubordinateNullStyle() {
    return {
      height: $(document).height() - 338,
    };
  }

  /**
   * 返回网络名称
   * @return {[type]} [description]
   */
  getNetWorkName() {
    let name = '';

    md.global.Account.projects.forEach(project => {
      if (project.projectId === config.projectId) {
        name = project.companyName;
      }
    });

    return name;
  }

  /**
   * 获取任务计数
   * @param {[[]]} taskTimeBars
   * @return {number}
   */
  getTaskCount(taskTimeBars) {
    let count = 0;
    taskTimeBars.forEach(item => {
      count += item.length;
    });

    return count > 99 ? '99+' : count;
  }

  /**
   * 修改用户配置展开缩起状态
   * @param  {string} accountId
   * @param  {boolean} hidden
   */
  updateUserStatus(accountId, hidden) {
    ajaxRequest.updateUserStatusOfSetting({
      projectId: config.projectId,
      accountId,
      isHidden: hidden,
    });

    this.props.dispatch(updateUserStatus(accountId, hidden));

    // 展开拉取数据
    if (!hidden) {
      this.props.getMoreSubordinateTasks([accountId], config.minStartTime, '');
    }
  }

  /**
   * 添加下属
   */
  addSubordinate() {
    let licenseType;
    md.global.Account.projects.forEach(project => {
      if (project.projectId === config.projectId) {
        licenseType = project.licenseType;
      }
    });

    if (licenseType === 0) {
      upgradeVersionDialog({
        projectId: config.projectId,
        explainText: _l('请升级至付费版解锁开启'),
        isFree: true,
      });
    } else {
      navigateTo(`/admin/reportRelation/${config.projectId}`);
    }
  }

  /**
   * 添加关注的同事
   */
  addFollowMembers() {
    const selectedAccountIds = this.props.accountTasksKV.map(item => item.account.accountId);

    dialogSelectUser({
      sourceId: config.folderId,
      title: _l('添加关注的同事'),
      showMoreInvite: false,
      fromType: 6,
      SelectUserSettings: {
        includeUndefinedAndMySelf: true,
        filterAccountIds: ['user-undefined'],
        selectedAccountIds,
        projectId: config.projectId,
        callback: users => {
          ajaxRequest
            .followUserOfSetting({
              projectId: config.projectId,
              accountIds: users.map(item => item.accountId),
            })
            .then(source => {
              if (source.status) {
                this.props.dispatch(addFollowMembers(users));
                this.props.getMoreSubordinateTasks(
                  users.map(item => item.accountId),
                  config.minStartTime,
                  '',
                );
                this.props.subordinateSocketSubscribe(users.map(item => item.accountId));
              }
            });
        },
      },
    });
  }

  /**
   * 添加关注的同事的tips
   */
  tooltip() {
    return <span>{_l('添加经常协作的同事，将显示他负责的任务中您可见的部分')}</span>;
  }

  /**
   * 创建任务
   * @param {object} account
   * @param {object} evt
   */
  createTask(account, evt) {
    evt.stopPropagation();

    $.CreateTask({
      ProjectID: config.projectId,
      ChargeArray: [
        {
          accountId: account.accountId,
          fullname: account.fullname,
          avatar: account.avatar,
        },
      ],
    });
  }

  /**
   * 更多操作内容
   * @param {object} account
   */
  renderPopup(account) {
    return (
      <ul className="ganttSubordinateMembersOp boxShadow5 boderRadAll_3">
        <li className="ThemeColor3 ThemeBGColor3" onClick={() => this.lookOtherTasks(account)}>
          <i className="icon-abstract" />
          {_l('更多任务')}
        </li>
        {account.type === 4 ? (
          <li className="ThemeColor3 ThemeBGColor3" onClick={() => this.removeMembers(account.accountId)}>
            <i className="icon-trash" />
            {_l('移除')}
          </li>
        ) : undefined}
      </ul>
    );
  }

  /**
   * 查看TA的任务
   * @param {object} account
   */
  lookOtherTasks(account) {
    this.props.dispatch(
      updateStateConfig(
        Object.assign({}, this.props.taskConfig, {
          listStatus: 0,
          listSort: 10,
          filterUserId: account.accountId,
          isSubUser: account.type === 3,
          lastMyProjectId: config.projectId,
          folderId: '',
          taskFilter: account.type === 3 ? 2 : 7,
        }),
      ),
    );
  }

  /**
   * 删除关注的同事
   * @param {string} accountId
   */
  removeMembers(accountId) {
    ajaxRequest
      .unfollowUserOfSetting({
        projectId: config.projectId,
        accountIds: [accountId],
      })
      .then(source => {
        if (source.status) {
          this.props.dispatch(removeFollowMembers(accountId));
        }
      });
  }

  render() {
    const { accountTasksKV } = this.props;
    const builtinPlacements = {
      bottomLeft: {
        points: ['tl', 'bl'],
      },
    };

    return (
      <div className="ganttMembers subordinateMembers">
        <div className="flexColumn">
          <div className="ganttNetwork relative">
            <div
              className="ganttNetworkName ThemeColor3 overflow_ellipsis"
              onMouseDown={evt =>
                this.checkMouseDownIsLeft(evt) && this.setState({ showNetwork: !this.state.showNetwork })
              }
            >
              {this.getNetWorkName()} <i className="icon-arrow-down-border" />
            </div>
            {this.state.showNetwork ? (
              <ClickAwayable
                component="ul"
                className={cx('boxShadow5 boderRadAll_3', { Hidden: !this.state.showNetwork })}
                onClickAway={() => this.setState({ showNetwork: false })}
              >
                {md.global.Account.projects.map((project, i) => {
                  return (
                    <li
                      key={i}
                      className="overflow_ellipsis ThemeColor3 ThemeBGColor3"
                      onClick={() => this.switchNetwork(project.projectId)}
                    >
                      <i className="icon-business" />
                      {project.companyName}
                    </li>
                  );
                })}
              </ClickAwayable>
            ) : undefined}
          </div>

          <ul
            className="ganttMembersList flex"
            ref={ganttMembersList => {
              this.ganttMembersList = ganttMembersList;
            }}
          >
            {accountTasksKV.length === 2 && accountTasksKV[0].account.hidden && accountTasksKV[1].account.hidden ? (
              <div className="ganttSubordinateNull" style={this.ganttSubordinateNullStyle()}>
                <i className="Font40 icon-group" />
                <div className="Font14 mTop15">{_l('您还没有下属')}</div>
                <div className="mTop5 ganttTextAlignLeft">
                  {_l('可前往 组织管理-员工汇报关系中设置，或关注与您协作的同事，查看相关任务进展。')}
                </div>
                <div
                  className="ganttSubordinateAddMember ThemeColor3 ThemeBorderColor3 mTop25"
                  onClick={() => this.addSubordinate()}
                >
                  {_l('添加下属')}
                </div>
              </div>
            ) : undefined}

            {accountTasksKV.map(item => {
              return (
                <li
                  key={item.account.accountId}
                  style={{ height: item.taskTimeBars.length * 26 }}
                  onClick={() => this.updateUserStatus(item.account.accountId, !item.account.hidden)}
                >
                  {item.account.type === 3 ? <i className="ganttTriangle" /> : undefined}

                  <UserHead
                    className={cx('ganttMembersAvatar', { ThemeBorderColor3: item.account.type === 4 })}
                    user={{
                      userHead: item.account.avatar,
                      accountId: item.account.accountId,
                    }}
                    size={24}
                  />
                  <span className="overflow_ellipsis">
                    {md.global.Account.accountId === item.account.accountId ? _l('我') : item.account.fullname}
                  </span>

                  {item.account.hidden ? undefined : <span>({this.getTaskCount(item.taskTimeBars)})</span>}

                  <Tooltip title={_l('创建新任务')} placement="bottomLeft">
                    <span
                      className="ganttMembersAddTask Font16 ThemeColor3"
                      onClick={evt => this.createTask(item.account, evt)}
                    >
                      <i className="icon-plus" />
                    </span>
                  </Tooltip>

                  {item.account.type === 3 || item.account.type === 4 ? (
                    <Trigger
                      action={['click']}
                      prefixCls="ganttSubordinateBox"
                      popup={this.renderPopup(item.account)}
                      builtinPlacements={builtinPlacements}
                      popupPlacement="bottomLeft"
                    >
                      <span className="ganttMembersOperation" onClick={evt => evt.stopPropagation()}>
                        <i className="icon-moreop ThemeColor3 Font16" />
                      </span>
                    </Trigger>
                  ) : undefined}
                </li>
              );
            })}
          </ul>

          <div className="ganttSubordinate ThemeColor3" onClick={evt => this.addFollowMembers(evt)}>
            <i className="icon-hr_person_add Font18 mRight5" />
            {_l('添加同事')}
            <Tooltip placement="top" title={this.tooltip()}>
              <i className="icon-info Font14 mLeft5" />
            </Tooltip>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(state => {
  const { accountTasksKV, taskConfig } = state.task;

  return {
    accountTasksKV,
    taskConfig,
  };
})(SubordinateMembers);
