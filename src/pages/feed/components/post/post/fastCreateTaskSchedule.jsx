import React from 'react';
import { autobind } from 'core-decorators';
import createTask from 'src/components/createTask/createTask';
import createCalendar from 'src/components/createCalendar/createCalendar';
import PropTypes from 'prop-types';
import withClickAway from 'ming-ui/decorators/withClickAway';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
const ClickAway = createDecoratedComponent(withClickAway);
import Menu from 'ming-ui/components/Menu';
import MenuItem from 'ming-ui/components/MenuItem';
import './postOperateList.css';
import _ from 'lodash';
import cx from 'classnames';

class FastCreateTaskSchedule extends React.Component {
  static propTypes = {
    selectText: PropTypes.any.isRequired,
    handFastCreate: PropTypes.func,
    style: PropTypes.any,
  };

  @autobind
  componentClickAway() {
    if (this.props.handFastCreate) {
      this.props.handFastCreate();
    }
  }

  @autobind
  toggleCreateNewCalender() {
    const selectText = _.clone(this.props.selectText);
    createCalendar({
      Message: selectText,
    });
    if (this.props.handFastCreate) {
      this.props.handFastCreate();
    }
  }

  @autobind
  toggleCreateNewTask() {
    const selectText = _.clone(this.props.selectText);

    createTask({
      Description: selectText,
      isFromPost: true,
    });
    if (this.props.handFastCreate) {
      this.props.handFastCreate();
    }
  }

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
