import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import ClickAway from 'ming-ui/components/ClickAway';
import Menu from 'ming-ui/components/Menu';
import MenuItem from 'ming-ui/components/MenuItem';
import createCalendar from 'src/components/createCalendar/load';
import createTask from 'src/components/createTask/load';
import './postOperateList.css';

class FastCreateTaskSchedule extends React.Component {
  static propTypes = {
    selectText: PropTypes.any.isRequired,
    handFastCreate: PropTypes.func,
    style: PropTypes.any,
  };

  componentClickAway = () => {
    if (this.props.handFastCreate) {
      this.props.handFastCreate();
    }
  };

  toggleCreateNewCalender = () => {
    const selectText = _.clone(this.props.selectText);
    createCalendar({
      Message: selectText,
    });
    if (this.props.handFastCreate) {
      this.props.handFastCreate();
    }
  };

  toggleCreateNewTask = () => {
    const selectText = _.clone(this.props.selectText);

    createTask({
      Description: selectText,
      isFromPost: true,
    });
    if (this.props.handFastCreate) {
      this.props.handFastCreate();
    }
  };

  render() {
    return (
      <ClickAway onClickAway={this.componentClickAway}>
        <Menu
          style={this.props.style}
          className={cx('fastCreateTaskSchedule tipBoxShadow', {
            hide: md.global.SysSettings.forbidSuites.includes('2') && md.global.SysSettings.forbidSuites.includes('3'),
          })}
        >
          {!md.global.SysSettings.forbidSuites.includes('2') && (
            <MenuItem className={'taskItem'} onClick={this.toggleCreateNewTask}>
              {_l('创建任务')}
            </MenuItem>
          )}
          {!md.global.SysSettings.forbidSuites.includes('3') && (
            <MenuItem className={'taskItem'} onClick={this.toggleCreateNewCalender}>
              {_l('加入日程')}
            </MenuItem>
          )}
        </Menu>
      </ClickAway>
    );
  }
}

export default FastCreateTaskSchedule;
