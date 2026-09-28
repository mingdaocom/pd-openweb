import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Dropdown } from 'ming-ui/antd-components';
import createCalendar from 'src/components/createCalendar/load';
import createTask from 'src/components/createTask/load';
import './postOperateList.css';

class FastCreateTaskSchedule extends React.Component {
  static propTypes = {
    selectText: PropTypes.any.isRequired,
    handFastCreate: PropTypes.func,
    style: PropTypes.any,
  };

  componentDidMount() {
    if (!this.getMenuItems().length) {
      this.closeMenu();
    }
  }

  closeMenu = () => {
    if (this.closed) return;

    this.closed = true;
    this.props.handFastCreate?.();
  };

  toggleCreateNewCalender = () => {
    const selectText = _.clone(this.props.selectText);
    createCalendar({
      Message: selectText,
    });
    this.closeMenu();
  };

  toggleCreateNewTask = () => {
    const selectText = _.clone(this.props.selectText);

    createTask({
      Description: selectText,
      isFromPost: true,
    });
    this.closeMenu();
  };

  getMenuItems = () => {
    const { forbidSuites = [] } = md.global.SysSettings;

    return [
      !forbidSuites.includes('2') && {
        key: 'task',
        label: _l('创建任务'),
        onClick: this.toggleCreateNewTask,
      },
      !forbidSuites.includes('3') && {
        key: 'calendar',
        label: _l('加入日程'),
        onClick: this.toggleCreateNewCalender,
      },
    ].filter(Boolean);
  };

  render() {
    const items = this.getMenuItems();
    if (!items.length) return null;

    return (
      <Dropdown
        open
        trigger={['click']}
        placement="bottomLeft"
        menu={{ items, style: { minWidth: 120 } }}
        onOpenChange={open => {
          if (!open) {
            this.closeMenu();
          }
        }}
      >
        <span className="fastCreateTaskScheduleTrigger" style={this.props.style} />
      </Dropdown>
    );
  }
}

export default FastCreateTaskSchedule;
