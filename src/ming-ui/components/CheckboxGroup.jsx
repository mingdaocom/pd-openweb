import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { default as Checkbox, SIZE_LIST } from './Checkbox';
import './less/CheckboxGroup.less';

class CheckboxGroup extends Component {
  static propTypes = {
    data: PropTypes.arrayOf(
      PropTypes.shape({
        text: PropTypes.any, // Raio显示的名称
        value: PropTypes.node, // 在回调中作为第二个参数返回
      }),
    ), // 数据
    defaultCheckedValues: PropTypes.array, // 默认选中
    checkedValues: PropTypes.array, // 传入checkedName之后，将只根据checkId来判断选中
    onChange: PropTypes.func, // 回调， onClick(value)
    size: PropTypes.oneOf(SIZE_LIST), // 大小 默认default
    children: PropTypes.any, // 子元素
    disabled: PropTypes.bool, // 是否禁用
    name: PropTypes.string, // 表单item名字
    className: PropTypes.string,
    /**
     * 是否垂直排列，默认为false
     */
    vertical: PropTypes.bool,
  };

  static defaultProps = {
    vertical: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      data: this.props.data || [],
    };
    this.data = _.cloneDeep(this.state.data);
  }

  state = {
    data: this.props.data,
  };

  componentWillMount() {
    const checkedValues = this.props.checkedValues || this.props.defaultCheckedValues || [];
    this.checkedArraytoData(checkedValues);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.checkedValues) {
      this.checkedArraytoData(nextProps.checkedValues);
    }
  }

  handleClick(checked, value) {
    const { onChange } = this.props;
    if (onChange) {
      onChange(value);
    }
  }

  checkedArraytoData(checkedArray) {
    if (!checkedArray) return;
    this.data = this.data.map(item => {
      if (checkedArray.indexOf(item.value) >= 0) {
        item.checked = true;
      } else {
        item.checked = false;
      }
      return item;
    });
    this.setState({
      data: this.data,
    });
  }

  render() {
    const { className, vertical } = this.props;
    const cls = cx('ming CheckboxGroup', {
      [className]: !!className,
      'CheckboxGroup--vertical': vertical,
    });
    return (
      <div className={cls}>
        {this.state.data.map((props, index) => (
          <Checkbox
            {...props}
            onClick={(...arg) => this.handleClick(...arg)}
            key={index}
            size={this.props.size}
            disabled={this.props.disabled}
          />
        ))}
      </div>
    );
  }
}

export default CheckboxGroup;
