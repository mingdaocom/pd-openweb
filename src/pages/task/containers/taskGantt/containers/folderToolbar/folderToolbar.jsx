import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Button, Dropdown, Tooltip } from 'ming-ui/antd-components';
import createTask from 'src/components/createTask/load';
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

const TASK_STATUS_DROPDOWN_STYLES = { root: { minWidth: 170 } };
const TASK_LEVEL_DROPDOWN_STYLES = { root: { minWidth: 168 } };

class FolderToolbar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ganttDialogVisible: false,
    };
  }

  /**
   * 返回当前状态所对应的名称
   */

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (!_.isEqual(this.props.taskConfig, prevProps.taskConfig)) {
        this.setState({
          ganttDialogVisible: false,
        });
      }
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
    this.props.dispatch(changeTaskStatus(status));
    this.props.dispatch(updateDataSource());
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
   * 切换显示子任务的层级
   * @param  {number} level
   */
  switchLevel(level) {
    this.props.dispatch(changeSubTaskLevel(level));
    this.props.dispatch(updateDataSource());
  }

  /**
   * 创建任务
   */
  createTask() {
    createTask();
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
    const taskStatuses = [
      { text: _l('进行中'), icon: 'icon-task-have-in', value: config.TASKSTATUS.NO_COMPLETED },
      { text: _l('已完成'), icon: 'icon-done_all', value: config.TASKSTATUS.COMPLETED },
      { text: _l('全部'), icon: 'icon-task-all', value: config.TASKSTATUS.ALL },
    ];
    const taskStatusItems = taskStatuses.map(item => ({
      key: String(item.value),
      icon: <i className={item.icon} />,
      label: item.text,
    }));
    const viewTypeList = [
      { text: _l('天'), value: config.VIEWTYPE.DAY },
      { text: _l('周%05034'), value: config.VIEWTYPE.WEEK },
      { text: _l('月%06010'), value: config.VIEWTYPE.MONTH },
    ];
    const filterWeekendList = [
      { text: _l('仅工作日'), value: true },
      { text: _l('显示周末'), value: false },
    ];
    const taskLevels = [
      { text: _l('展开全部层级'), value: config.SUBTASKLEVEL.ALL },
      { text: _l('展开到%0级任务', 1), value: config.SUBTASKLEVEL.ONE },
      { text: _l('展开到%0级任务', 2), value: config.SUBTASKLEVEL.TWO },
      { text: _l('展开到%0级任务', 3), value: config.SUBTASKLEVEL.THREE },
      { text: _l('展开到%0级任务', 4), value: config.SUBTASKLEVEL.FOUR },
      { text: _l('展开到%0级任务', 5), value: config.SUBTASKLEVEL.FIVE },
    ];
    const taskLevelItems = taskLevels.flatMap((item, index) => [
      {
        key: String(item.value),
        label: item.text,
      },
      ...(index === 0 ? [{ type: 'divider' }] : []),
    ]);

    return (
      <div className="folderToolbar">
        <span className="taskStatusBox">
          <Dropdown
            trigger={['click']}
            placement="bottomLeft"
            styles={TASK_STATUS_DROPDOWN_STYLES}
            menu={{
              items: taskStatusItems,
              selectable: true,
              selectedKeys: [String(stateConfig.currentStatus)],
              onClick: ({ key }) => this.switchStatus(Number(key)),
            }}
          >
            <span className="taskStatus pointer">
              <span>{this.getTaskStatusName()}</span>
              <i className="Font12 icon-arrow-down-border" />
            </span>
          </Dropdown>
        </span>

        <Button.Group className="folderGanttBtn">
          {viewTypeList.map(item => (
            <Button
              key={item.value}
              size="small"
              type={stateConfig.currentView === item.value ? 'primary' : 'default'}
              onClick={() => this.switchView(item.value)}
            >
              {item.text}
            </Button>
          ))}
        </Button.Group>

        <Button.Group className="folderGanttBtn folderGanttWeekBtn">
          {filterWeekendList.map(item => (
            <Button
              key={String(item.value)}
              size="small"
              type={stateConfig.filterWeekend === item.value ? 'primary' : 'default'}
              onClick={() => this.filterWeekend(item.value)}
            >
              {item.text}
            </Button>
          ))}
        </Button.Group>

        <Tooltip title={_l('展开层级')}>
          <Dropdown
            trigger={['click']}
            placement="bottomLeft"
            styles={TASK_LEVEL_DROPDOWN_STYLES}
            menu={{
              items: taskLevelItems,
              selectable: true,
              selectedKeys: [String(stateConfig.currentLevel)],
              onClick: ({ key }) => this.switchLevel(Number(key)),
            }}
          >
            <span className="folderGanttLevelBtn pointer">
              <i className="icon-task-show-tree Font15" />
            </span>
          </Dropdown>
        </Tooltip>

        {this.props.showStaticGantt && (
          <span
            className="Right pointer mRight20 folderStaticGantt colorPrimary"
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
