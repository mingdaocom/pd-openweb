/* eslint-disable */
/* eslint-disable */
/* eslint-disable */
/* eslint-disable */
import PropTypes from 'prop-types';

import React, { Component } from 'react';
import classNames from 'classnames';
import withChildren from 'ming-ui/decorators/withChildren';
import formControl from 'ming-ui/decorators/formControl';
import { default as Radio, SIZE_LIST } from './Radio';

export { Radio, SIZE_LIST };

@formControl
@withChildren
class RadioGroup extends Component {
  /* eslint-disable */
  static propTypes = {
    data: PropTypes.arrayOf(
      PropTypes.shape({
        text: PropTypes.any, // Radio显示的名称
        value: PropTypes.any, // 在回调中作为第二个参数返回
        icon: PropTypes.any,
      })
    ), // 数据
    defaultCheckedValue: PropTypes.any, // 默认选中
    checkedValue: PropTypes.any, // 传入checkedValue之后，将只根据checkId来判断选中
    onChange: PropTypes.func, // 回调， onClick(value)
    size: PropTypes.oneOf(SIZE_LIST), // 大小 默认default
    children: PropTypes.node, // 子元素
    disabled: PropTypes.bool, // 是否禁用
    name: PropTypes.string, // 表单item名字
    $formDataChange: PropTypes.func, // 给withChildren用
    className: PropTypes.string,
    /**
     * 是否垂直排列，默认为false
     */
    vertical: PropTypes.bool,
  };
  /* eslint-enable */
  static defaultProps = {
    vertical: false,
  };
  static defaultProps = {
    vertical: false,
  };

  constructor(props) {
    super(props);
    const data = this.props.data || [];
    // const checkedValue = this.props.defaultCheckedValue || this.props.checkedValue || null;
    const checkedValue =
      this.props.defaultCheckedValue !== undefined ? this.props.defaultCheckedValue : this.props.checkedValue !== undefined ? this.props.checkedValue : null;

    const list = data.map(item => {
      item.checked = item.value === checkedValue;
      return item;
    });
    this.state = {
      data: list,
    };
    this.props.$formDataChange(checkedValue);
  }

  state = {
    data: this.props.data,
  };

  componentWillReceiveProps(nextProps) {
    this.refreshId(nextProps.checkedValue, nextProps.data);
  }

  handleClick(value) {
    const { onChange, checkedValue } = this.props;

    this.refreshId(value, this.state.data);
    this.props.$formDataChange(value);

    if (onChange) {
      onChange(value);
    }
  }

  refreshId(value, data) {
    data = data.map(item => {
      item.checked = item.value === value;

      return item;
    });

    this.setState({
      data,
    });
  }

  render() {
    const { className, vertical, style } = this.props;
    const cls = classNames('ming RadioGroup', {
      [className]: !!className,
      'RadioGroup--vertical': vertical,
    });
    return (
      <div style={style} className={cls}>
        {this.state.data.map((props, index) => (
          <Radio
            {...props}
            onClick={(...arg) => this.handleClick(...arg)}
            key={index}
            size={this.props.size}
            disabled={this.props.disabled || props.disabled}
          />
        ))}
      </div>
    );
  }
}

export default RadioGroup;
