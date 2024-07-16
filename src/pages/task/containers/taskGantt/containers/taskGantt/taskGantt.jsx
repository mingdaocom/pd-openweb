import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import MouseBackEnd from '@mdfe/react-dnd-mouse-backend';
import { connect } from 'react-redux';
import './taskGantt.less';
import FolderToolbar from '../folderToolbar/folderToolbar';
import Members from '../members/members';
import SubordinateMembers from '../subordinateMembers/subordinateMembers';
import TimeAxis from '../timeAxis/timeAxis';
import TimeBarContainer from '../timeBarContainer/timeBarContainer';
import config from '../../config/config';
import {
  getTimeAxisSource,
  updateDataSource,
  updateFolderSocketSource,
  updateSubordinateSocketSource,
  changeTaskStatus,
  moreSubordinateTasks,
} from '../../redux/actions';
import ajaxRequest from 'src/api/taskCenter';
import _ from 'lodash';
import moment from 'moment';
import { LoadDiv } from 'ming-ui';

class TaskGantt extends Component {
  constructor(props) {
    super(props);
    config.projectId = props.taskConfig.projectId;
    config.folderId = props.taskConfig.folderId;
    config.isRequestComplete = false;
  }

  componentWillMount() {
    this.getSource();
  }

  componentDidMount() {
    this.socketMonitor();

    // 项目下的时间视图
    if (config.folderId) {
      this.socketSubscribe();

      // 10分钟重新订阅一下
      setInterval(() => {
        this.socketSubscribe();
      }, 600000);
    } else {
      // 10分钟重新订阅我的下属一下
      setInterval(() => {
        if (this.props.accountTasksKV) {
          this.subordinateSocketSubscribe(this.props.accountTasksKV.map(item => item.account.accountId));
        }
      }, 600000);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.taskConfig, this.props.taskConfig)) {
      config.projectId = nextProps.taskConfig.projectId;
      config.folderId = nextProps.taskConfig.folderId;
      this.getSource();
    }
  }

  /**
   * 获取数据
   */
  getSource() {
    // 项目
    if (config.folderId) {
      this.getFolderTaskGantt();
    } else {
      // 下属
      // 获取网络配置
      ajaxRequest.getSettingDefualtProjectId().then(source => {
        if (source.status) {
          this.getSetting(source.data);
        }
      });
    }
  }

  /**
   * 甘特图socket订阅
   */
  socketSubscribe() {
    IM.socket.emit('subscribe', { type: 'folder2', sourceId: config.folderId + '|' + md.global.Account.accountId });
  }

  /**
   * 甘特图socket监听
   */
  socketMonitor() {
    IM.socket.removeAllListeners('subscribe message');
    IM.socket.on('subscribe message', data => {
      // 推回来的项目id就是当前项目并且当前视图还是甘特图  或  推回来的项目id包含当前网络id并且在我的下属时间tab
      if (
        config.folderId === data.fid ||
        (data.id.indexOf(config.projectId) >= 0 && $('.subordinateTabs .active').index() === 0)
      ) {
        let isDateUpdate = false;

        data.data.forEach(item => {
          if (item.eventType === 'U_time' || item.eventType === 'U_parent' || item.eventType === 'A_task') {
            // 开始时间小于最小时间
            if (item.startTime && moment(item.startTime) < moment(config.minStartTime)) {
              isDateUpdate = true;
              config.minStartTime = item.startTime;
            }
            // 截止时间大于最大时间
            if (item.deadline && moment(item.deadline) > moment(config.maxEndTime)) {
              isDateUpdate = true;
              config.maxEndTime = item.deadline;
            }
          }
        });

        // 时间变更
        if (isDateUpdate) {
          this.props.dispatch(getTimeAxisSource());
        }

        // 更新数据
        if (config.folderId === data.fid) {
          this.props.dispatch(updateFolderSocketSource(data));
        } else {
          this.props.dispatch(updateSubordinateSocketSource(data));
        }
      }
    });
  }

  /**
   * 我的下属甘特图socket订阅
   * @param {array} members
   */
  subordinateSocketSubscribe(members) {
    members.forEach(accountId => {
      IM.socket.emit('subscribe', {
        type: 'subordinate',
        sourceId: `${config.projectId}|${md.global.Account.accountId}|${accountId}`,
      });
    });
  }

  /**
   * 获取项目下的任务
   */
  getFolderTaskGantt() {
    ajaxRequest.getFolderTaskGantt({ folderId: config.folderId }).then(source => {
      if (source.status) {
        // 服务器时间向上取整 + 1小时
        config.timeStamp = moment(source.data.timeStamp).add(1, 'h').format('YYYY-MM-DD HH:00');
        config.minStartTime = source.data.minTime;
        config.maxEndTime = source.data.maxTime;
        config.isRequestComplete = true;

        this.props.dispatch(getTimeAxisSource());
        this.props.dispatch(updateDataSource(source.data.accountTasksKV));
      } else {
        alert(_l('操作失败，请稍后重试'), 2);
      }
    });
  }

  /**
   * 获取单个网络的成员
   * @param {string} projectId
   */
  getSetting(projectId) {
    config.projectId = projectId;

    ajaxRequest.getSetting({ projectId }).then(source => {
      if (source.status) {
        // 默认最小时间
        if (this.props.stateConfig.currentView === config.VIEWTYPE.DAY) {
          config.minStartTime = moment().add(-6, 'w').format('YYYY-MM-DD HH:00');
        } else if (this.props.stateConfig.currentView === config.VIEWTYPE.WEEK) {
          config.minStartTime = moment().add(-12, 'w').format('YYYY-MM-DD HH:00');
        } else if (this.props.stateConfig.currentView === config.VIEWTYPE.MONTH) {
          config.minStartTime = moment().add(-24, 'w').format('YYYY-MM-DD HH:00');
        }

        // 默认最大时间
        config.maxEndTime = '';

        this.getFirstSubordinateTasks(source.data);
        this.subordinateSocketSubscribe(source.data.map(item => item.accountId));
      }
    });
  }

  /**
   * 第一次的下属任务
   * @param {array} members
   */
  getFirstSubordinateTasks(members) {
    const accountIds = [];
    members.forEach(item => {
      if (!item.hidden) {
        accountIds.push(item.accountId);
      }
    });
    const subordinateTasksKV = members.map(item => {
      return {
        account: item,
        tasks: [],
      };
    });

    ajaxRequest
      .getSubordinateTaskGantt({
        projectId: config.projectId,
        accountIds: accountIds,
        startTime: config.minStartTime,
        endTime: config.maxEndTime,
      })
      .then(source => {
        if (source.status) {
          // 加载完成
          config.isRequestComplete = true;
          // 服务器时间
          config.timeStamp = moment(source.data.timeStamp).add(1, 'h').format('YYYY-MM-DD HH:00');

          // 更新最大截止时间
          if (!config.maxEndTime || moment(config.maxEndTime) < moment(source.data.maxTime)) {
            config.maxEndTime = source.data.maxTime;
            this.props.dispatch(getTimeAxisSource());
          }

          // 数据填充
          source.data.accountTasksKV.forEach(item => {
            subordinateTasksKV.forEach(subordinate => {
              if (item.account.accountId === subordinate.account.accountId) {
                subordinate.tasks = item.tasks;
              }
            });
          });

          // 切换筛选任务进行中
          this.props.dispatch(changeTaskStatus(config.TASKSTATUS.NO_COMPLETED));
          // 更新数据
          this.props.dispatch(updateDataSource(subordinateTasksKV));
        }
      });
  }

  /**
   * 获取更多的下属任务
   * @param {array} accountIds
   * @param {string} startTime
   * @param {string} endTime
   * @return {object}
   */
  getMoreSubordinateTasks(accountIds, startTime, endTime) {
    config.isReady = false;

    ajaxRequest
      .getSubordinateTaskGantt({
        projectId: config.projectId,
        accountIds: accountIds,
        startTime,
        endTime,
      })
      .then(source => {
        if (source.status) {
          // 更新最大截止时间
          if (!config.maxEndTime || moment(config.maxEndTime) < moment(source.data.maxTime)) {
            config.maxEndTime = source.data.maxTime;
            this.props.dispatch(getTimeAxisSource());
          }

          // 更新数据
          this.props.dispatch(moreSubordinateTasks(source.data.accountTasksKV));

          // 无数据 或已经靠边了
          if (source.data.length || $('.timeBarContainer').scrollLeft() < 50) {
            $('.timeBarContainer').scrollLeft(50);
          }

          config.isReady = true;
        }
      });
  }

  render() {
    return (
      <div className="taskGanttContainer flexColumn">
        <FolderToolbar showStaticGantt={!!config.folderId} />

        {config.isRequestComplete && this.props.accountTasksKV.length ? (
          <div className="ganttMain flex flexRow">
            {config.folderId ? (
              <Members />
            ) : (
              <SubordinateMembers
                getSetting={this.getSetting.bind(this)}
                getMoreSubordinateTasks={this.getMoreSubordinateTasks.bind(this)}
                subordinateSocketSubscribe={this.subordinateSocketSubscribe.bind(this)}
              />
            )}
            <div className="flex flexColumn">
              <TimeAxis />
              <TimeBarContainer getMoreSubordinateTasks={this.getMoreSubordinateTasks.bind(this)} />
            </div>
          </div>
        ) : (
          <div id="taskFilterLoading">
            <div className="loadingCenter">
              <LoadDiv />
            </div>
          </div>
        )}
      </div>
    );
  }
}

const DragTaskGantt = DragDropContext(MouseBackEnd)(
  connect(state => {
    const { accountTasksKV, stateConfig, taskConfig } = state.task;

    return {
      accountTasksKV,
      stateConfig,
      taskConfig,
    };
  })(TaskGantt),
);

export default DragTaskGantt;
