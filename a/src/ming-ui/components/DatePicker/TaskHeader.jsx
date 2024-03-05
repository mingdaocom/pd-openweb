import PropTypes from 'prop-types';
import React, { Component } from 'react';

import Checkbox from 'ming-ui/components/Checkbox';

class TaskHeader extends Component {
  /**
   * 切换开始和结束的选中状态
   */
  toggle = (type, checked) => {
    if (this.props.toggle) {
      this.props.toggle(type, checked);
    }
  };

  render() {
    return (
      <div className="calender-task-header">
        <div className="calender-task-header-col">
          <Checkbox
            key="start"
            checked={this.props.startChecked}
            onClick={() => {
              this.toggle('start', !this.props.startChecked);
            }}
          >
            开始时间
          </Checkbox>
        </div>
        <div className="calender-task-header-col">
          <Checkbox
            key="end"
            checked={this.props.endChecked}
            onClick={() => {
              this.toggle('end', !this.props.endChecked);
            }}
          >
            结束时间
          </Checkbox>
        </div>
      </div>
    );
  }
}

TaskHeader.propTypes = {
  /**
   * 开始是否选中
   */
  startChecked: PropTypes.bool,
  /**
   * 结束是否选中
   */
  endChecked: PropTypes.bool,
  /**
   * 切换开始和结束的选中状态
   * @param {string} type - 类型
   * @param {boolean} checked - 切换到选中/非选中状态
   */
  toggle: PropTypes.func,
};

TaskHeader.defaultProps = {
  startChecked: false,
  endChecked: false,
  toggle: (type) => {
    //
  },
};

export default TaskHeader;
