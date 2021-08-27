import ClickAwayable from '../../../mixins/clickAwayable';
import Menu from 'ming-ui/components/Menu';
import MenuItem from 'ming-ui/components/MenuItem';
import './postOperateList.css';
import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';

import createReactClass from 'create-react-class';

const FastCreateTaskSchedule = createReactClass({
  displayName: 'FastCreateTaskSchedule',

  propTypes: {
    selectText: PropTypes.any.isRequired,
    handFastCreate: PropTypes.func,
    style: PropTypes.any,
  },

  mixins: [ClickAwayable],

  componentClickAway() {
    if (this.props.handFastCreate) {
      this.props.handFastCreate();
    }
  },

  toggleCreateNewCalender() {
    const selectText = _.clone(this.props.selectText);
    require(['createCalendar'], (createCalendar) => {
      createCalendar.index({
        Message: selectText,
      });
    });
    if (this.props.handFastCreate) {
      this.props.handFastCreate();
    }
  },

  toggleCreateNewTask() {
    const selectText = _.clone(this.props.selectText);
    require(['createTask'], (createTask) => {
      createTask.index({
        Description: selectText,
        isFromPost: true,
      });
    });
    if (this.props.handFastCreate) {
      this.props.handFastCreate();
    }
  },

  render() {
    return (
      <Menu style={this.props.style} className={cx('fastCreateTaskSchedule tipBoxShadow', { hide: md.global.SysSettings.forbidSuites.includes('2') && md.global.SysSettings.forbidSuites.includes('3') })}>
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
    );
  },
});

module.exports = FastCreateTaskSchedule;
