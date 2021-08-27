import PropTypes from 'prop-types';
import React, { Component } from 'react';

import Group from './group';

class UiCheckBoxGroup extends Component {
  constructor(props) {
    super(props);

    /**
     * 全部分组的数据
     */
    this.values = {};
  }

  /**
   * 分组数据发生变化
   */
  groupOnChange = (event, id, values, data) => {
    this.values[id] = values;

    if (this.props.onChange) {
      this.props.onChange(event, this.values);
    }
  };

  renderGroups = () => {
    const groups = this.props.data.map((item, i, list) => {
      return (
        <Group
          key={item.id}
          name={item.name}
          data={item.data}
          disabled={item.disabled}
          onChange={(event, values, data) => {
            this.groupOnChange(event, item.id, values, data);
          }}
        />
      );
    });

    return groups;
  };

  render() {
    const groups = this.renderGroups();

    return <div className="ui-checkboxgroup">{groups}</div>;
  }
}

UiCheckBoxGroup.propTypes = {
  /**
   * 分组列表
   */
  data: PropTypes.any,
  /**
   * 【回调】选中的值改变
   * @param {Event} event - 触发事件
   * @param {Object} values - 分组数据
   */
  onChange: PropTypes.func,
};

UiCheckBoxGroup.defaultProps = {
  data: [],
  onChange: (event, values) => {
    //
  },
};

export default UiCheckBoxGroup;
