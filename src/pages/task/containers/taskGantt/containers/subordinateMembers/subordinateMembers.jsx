import React, { Component } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import { UserHead } from 'ming-ui';
import { Button, Dropdown, Tooltip } from 'ming-ui/antd-components';
import { dialogSelectUser } from 'ming-ui/functions';
import ajaxRequest from 'src/api/taskCenter';
import createTask from 'src/components/createTask/load';
import { upgradeVersionDialog } from 'src/components/upgradeVersion';
import { navigateTo } from 'src/router/navigation/navigateTo';
import { updateStateConfig } from '../../../../redux/actions';
import config from '../../config/config';
import { addFollowMembers, removeFollowMembers, updateUserStatus } from '../../redux/actions';
import './subordinateMembers.less';

const NETWORK_MENU_STYLE = { minWidth: 200, maxHeight: 160, overflowY: 'auto' };
const ADD_SUBORDINATE_BUTTON_STYLE = { width: 120 };

class SubordinateMembers extends Component {
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
    this.props.getSetting(projectId);
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

    createTask({
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

  getOperationMenu(account) {
    const items = [
      {
        key: 'moreTasks',
        icon: <i className="icon-abstract" />,
        label: _l('更多任务'),
      },
    ];

    if (account.type === 4) {
      items.push({
        key: 'remove',
        icon: <i className="icon-trash" />,
        label: _l('移除'),
      });
    }

    return {
      items,
      onClick: ({ key, domEvent }) => {
        domEvent.stopPropagation();

        if (key === 'moreTasks') {
          this.lookOtherTasks(account);
        } else if (key === 'remove') {
          this.removeMembers(account.accountId);
        }
      },
    };
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
    const networkItems = md.global.Account.projects.map(project => ({
      key: project.projectId,
      icon: <i className="icon-business" />,
      label: project.companyName,
    }));

    return (
      <div className="ganttMembers subordinateMembers">
        <div className="flexColumn">
          <div className="ganttNetwork relative">
            <Dropdown
              trigger={['click']}
              placement="bottomLeft"
              menu={{
                items: networkItems,
                selectable: true,
                selectedKeys: [config.projectId],
                style: NETWORK_MENU_STYLE,
                onClick: ({ key }) => this.switchNetwork(key),
              }}
            >
              <div className="ganttNetworkName colorPrimary overflow_ellipsis">
                {this.getNetWorkName()} <i className="icon-arrow-down-border" />
              </div>
            </Dropdown>
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
                <Button
                  className="mTop25"
                  color="primary"
                  variant="outlined"
                  style={ADD_SUBORDINATE_BUTTON_STYLE}
                  onClick={() => this.addSubordinate()}
                >
                  {_l('添加下属')}
                </Button>
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
                    className={cx('ganttMembersAvatar', { borderColorPrimary: item.account.type === 4 })}
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
                      className="ganttMembersAddTask Font16 colorPrimary"
                      onClick={evt => this.createTask(item.account, evt)}
                    >
                      <i className="icon-plus" />
                    </span>
                  </Tooltip>

                  {item.account.type === 3 || item.account.type === 4 ? (
                    <Dropdown trigger={['click']} placement="bottomLeft" menu={this.getOperationMenu(item.account)}>
                      <span className="ganttMembersOperation" onClick={evt => evt.stopPropagation()}>
                        <i className="icon-moreop colorPrimary Font16" />
                      </span>
                    </Dropdown>
                  ) : undefined}
                </li>
              );
            })}
          </ul>

          <div className="ganttSubordinate colorPrimary" onClick={evt => this.addFollowMembers(evt)}>
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
