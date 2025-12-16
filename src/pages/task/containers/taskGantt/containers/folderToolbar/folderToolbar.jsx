import React, { Component } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import _ from 'lodash';
import { Tooltip } from 'ming-ui/antd-components';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import withClickAway from 'ming-ui/decorators/withClickAway';
import GanttDialog from '../../component/ganttDialog';
import config from '../../config/config';
import {
  changeFilterWeekend,
  changeSubTaskLevel,
  changeTaskStatus,
  changeView,
  getTimeAxisSource,
  updateDataSource,
} from '../../redux/actions';
import './folderToolbar.less';

const ClickAwayable = createDecoratedComponent(withClickAway);

class FolderToolbar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ganttDialogVisible: false,
      showOperator: false,
      showLevel: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.taskConfig, this.props.taskConfig)) {
      this.setState({ ganttDialogVisible: false });
    }
  }

  /**
   * 返回当前状态所对应的名称
   */
  getTaskStatusName() {
    switch (this.props.stateConfig.currentStatus) {
      case 0:
        return _l('进行中');
      case 1:
        return _l('已完成');
      case -1:
        return _l('全部');
    }
  }

  /**
   * 修改任务状态
   * @param  {number} status
   */
  switchStatus(status) {
    this.setState({ showOperator: false });
    this.props.dispatch(changeTaskStatus(status));
    this.props.dispatch(updateDataSource());
  }

  /**
   * 检查是左键点击
   * @param  {object} evt
   */
  checkMouseDownIsLeft(evt) {
    return evt.button === 0;
  }

  /**
   * 切换视图
   * @param  {number} viewType
   */
  switchView(viewType) {
    this.props.dispatch(changeView(viewType));
    this.props.dispatch(getTimeAxisSource());
    this.props.dispatch(updateDataSource());
  }

  /**
   * 是否显示周末
   * @param  {boolean} filter  true: 不显示  false: 显示
   */
  filterWeekend(filter) {
    this.props.dispatch(changeFilterWeekend(filter));
    this.props.dispatch(getTimeAxisSource());
    this.props.dispatch(updateDataSource());
  }

  /**
   * 显示子任务层级
   * @param  {object} evt
   */
  showTaskLevel(evt) {
    this.checkMouseDownIsLeft(evt);
    this.setState({
      showLevel: !this.state.showLevel,
      taskLevelOffsetLeft: evt.currentTarget.offsetLeft,
    });
  }

  /**
   * 切换显示子任务的层级
   * @param  {number} level
   */
  switchLevel(level) {
    this.setState({ showLevel: false });
    this.props.dispatch(changeSubTaskLevel(level));
    this.props.dispatch(updateDataSource());
  }

  /**
   * 创建任务
   */
  createTask() {
    $.CreateTask();
  }

  /**
   * 打开关闭静态甘特图
   */
  switchGanttDialogVisible = (visible = true) => {
    this.setState({
      ganttDialogVisible: visible,
    });
  };

  render() {
    const { stateConfig } = this.props;
    const { ganttDialogVisible } = this.state;
    const taskStatusList = [
      { text: _l('进行中'), icon: 'icon-task-have-in', value: config.TASKSTATUS.NO_COMPLETED },
      { text: _l('已完成'), icon: 'icon-done_all', value: config.TASKSTATUS.COMPLETED },
      { text: _l('全部'), icon: 'icon-task-all', value: config.TASKSTATUS.ALL },
    ];
    const viewTypeList = [
      { text: _l('天'), value: config.VIEWTYPE.DAY },
      { text: _l('周%05034'), value: config.VIEWTYPE.WEEK },
      { text: _l('月%06010'), value: config.VIEWTYPE.MONTH },
    ];
    const filterWeekendList = [
      { text: _l('仅工作日'), value: true },
      { text: _l('显示周末'), value: false },
    ];
    const taskLevelList = [
      { text: _l('展开全部层级'), value: config.SUBTASKLEVEL.ALL },
      { text: _l('展开到%0级任务', 1), value: config.SUBTASKLEVEL.ONE },
      { text: _l('展开到%0级任务', 2), value: config.SUBTASKLEVEL.TWO },
      { text: _l('展开到%0级任务', 3), value: config.SUBTASKLEVEL.THREE },
      { text: _l('展开到%0级任务', 4), value: config.SUBTASKLEVEL.FOUR },
      { text: _l('展开到%0级任务', 5), value: config.SUBTASKLEVEL.FIVE },
    ];

    return (
      <div className="folderToolbar">
        <span className="taskStatusBox">
          <span
            className="taskStatus pointer"
            onMouseDown={evt =>
              this.checkMouseDownIsLeft(evt) && this.setState({ showOperator: !this.state.showOperator })
            }
          >
            <span>{this.getTaskStatusName()}</span>
            <i className="Font12 icon-arrow-down-border" />
          </span>
        </span>

        {this.state.showOperator ? (
          <ClickAwayable
            component="ul"
            className={cx('taskStatusList boxShadow5 boderRadAll_3', { Hidden: !this.state.showOperator })}
            onClickAway={() => this.setState({ showOperator: false })}
          >
            {taskStatusList.map((item, i) => {
              return (
                <li
                  key={i}
                  className={cx('ThemeBGColor3', { ThemeColor3: stateConfig.currentStatus === item.value })}
                  onClick={() => this.switchStatus(item.value)}
                >
                  <i className={item.icon} />
                  {item.text}
                </li>
              );
            })}
          </ClickAwayable>
        ) : undefined}

        <ul className="folderGanttBtn">
          {viewTypeList.map((item, i) => {
            return (
              <li
                key={i}
                className={cx({ active: stateConfig.currentView === item.value })}
                onClick={() => this.switchView(item.value)}
              >
                {item.text}
              </li>
            );
          })}
        </ul>

        <ul className="folderGanttBtn folderGanttWeekBtn">
          {filterWeekendList.map((item, i) => {
            return (
              <li
                key={i}
                className={cx({ active: stateConfig.filterWeekend === item.value })}
                onClick={() => this.filterWeekend(item.value)}
              >
                {item.text}
              </li>
            );
          })}
        </ul>

        <Tooltip title={_l('展开层级')}>
          <span className="folderGanttLevelBtn pointer" onMouseDown={evt => this.showTaskLevel(evt)}>
            <i className="icon-task-show-tree Font15" />
          </span>
        </Tooltip>

        {this.state.showLevel ? (
          <ClickAwayable
            component="ul"
            className={cx('taskLevel boxShadow5 boderRadAll_3', { Hidden: !this.state.showLevel })}
            style={{ left: this.state.taskLevelOffsetLeft }}
            onClickAway={() => this.setState({ showLevel: false })}
          >
            {taskLevelList.map((item, i) => {
              return (
                <li key={i} className="ThemeBGColor3" onClick={() => this.switchLevel(item.value)}>
                  {item.text}
                </li>
              );
            })}
          </ClickAwayable>
        ) : undefined}

        {this.props.showStaticGantt && (
          <span
            className="Right pointer mRight20 folderStaticGantt ThemeColor3"
            onClick={() => this.switchGanttDialogVisible()}
          >
            <i className="Font16 icon-gantt_chart mRight5" />
            {_l('甘特图')}
          </span>
        )}
        {ganttDialogVisible && <GanttDialog folderID={config.folderId} closeLayer={this.switchGanttDialogVisible} />}
      </div>
    );
  }
}

export default connect(state => {
  const { stateConfig, taskConfig } = state.task;

  return {
    stateConfig,
    taskConfig,
  };
})(FolderToolbar);
