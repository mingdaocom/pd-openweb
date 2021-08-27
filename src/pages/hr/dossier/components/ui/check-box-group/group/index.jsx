import PropTypes from 'prop-types';
import React, { Component } from 'react';

import './style.less';

import CheckBox from '../../../check-box';
import CheckBoxGroup from '../../../check-box-group';

class UiCheckBoxGroup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      /**
       * 全部值
       */
      values: this.getValues(props.data),
      /**
       * 是否全部选中
       */
      allChecked: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) {
      const values = this.getValues(nextProps.data);

      this.setState({
        values,
      });
    }
  }

  /**
   * 选中数据发生变化
   */
  onChange = (event, values, data) => {
    if (this.props.onChange) {
      this.props.onChange(event, values, data);
    }
  };

  /**
   * 获取所有选中的值
   */
  getValues = (list) => {
    const values = {};

    list.map((item, i, _list) => {
      if (item.checked) {
        values[item.value] = true;
      }

      return null;
    });

    return values;
  };

  /**
   * 切换全选/取消全选
   */
  toggleAllChecked = (event, checked) => {
    const values = Object.assign({}, this.state.values);

    this.props.data.map((item, i, list) => {
      if (!item.disabled) {
        values[item.value] = checked;
      }

      return null;
    });

    this.onChange(event, values, {
      prevValue: this.state.values,
    });

    this.setState({
      values,
      allChecked: checked,
    });
  };

  /**
   * 选中状态发生变化
   */
  groupOnChange = (event, values, data) => {
    let checkedLength = 0;
    this.props.data.map((item, i, list) => {
      if (values && values[item.value]) {
        checkedLength += 1;
      }
      return null;
    });

    this.onChange(event, values, {
      prevValue: this.state.values,
    });

    this.setState({
      allChecked: !!(checkedLength && checkedLength === this.props.data.length),
    });
  };

  render() {
    return (
      <div className="ui-checkboxgroup-group">
        <h3 className="ui-checkboxgroup-group-name">
          <span>{this.props.name}</span>
          <CheckBox
            checked={this.state.allChecked}
            label={_l('全选')}
            disabled={this.props.disabled}
            onChange={(event, checked) => {
              this.toggleAllChecked(event, checked);
            }}
          />
        </h3>
        <CheckBoxGroup
          data={this.props.data}
          value={this.state.values}
          disabled={this.props.disabled}
          display="grid"
          itemsInSingleRow={6}
          onChange={(event, values, data) => {
            this.groupOnChange(event, values, data);
          }}
        />
      </div>
    );
  }
}

UiCheckBoxGroup.propTypes = {
  /**
   * 分组名称
   */
  name: PropTypes.string,
  /**
   * 选项列表
   */
  data: PropTypes.arrayOf(
    PropTypes.shape({
      /**
       * 选项展示文本
       */
      label: PropTypes.string,
      /**
       * 选项值
       */
      value: PropTypes.any,
      /**
       * 是否选中
       */
      checked: PropTypes.bool,
      /**
       * 是否禁用
       */
      disabled: PropTypes.bool,
    })
  ),
  /**
   * 是否禁用
   */
  disabled: PropTypes.bool,
  /**
   * 选项改变回调
   * @param {Event} event - 点击事件
   * @param {object} values - 所有值
   * @param {object} data - 其他数据
   * data.item - 选中的项目
   * data.prevValue - 之前的值
   */
  onChange: PropTypes.func,
};

UiCheckBoxGroup.defaultProps = {
  name: '',
  data: [],
  disabled: false,
  onChange: (event, values, data) => {
    //
  },
};

export default UiCheckBoxGroup;
