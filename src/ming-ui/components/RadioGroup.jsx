import React, { Component } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { default as Radio, SIZE_LIST } from './Radio';

export { Radio, SIZE_LIST };

const formatData = (value, data) => {
  if (value === null || value === undefined || value === '') {
    return data;
  } else {
    return (data || []).map(item => {
      item.checked = item.value === value;
      return item;
    });
  }
};

class RadioGroup extends Component {
  static propTypes = {
    data: PropTypes.arrayOf(
      PropTypes.shape({
        text: PropTypes.any, // Raio显示的名称
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
      }),
    ), // 数据
    checked: PropTypes.string, // 选中
    defaultCheckedValue: PropTypes.string, // 默认选中
    checkedValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // 传入checkedValue之后，将只根据checkId来判断选中
    onChange: PropTypes.func, // 回调， onClick(value)
    size: PropTypes.oneOf(SIZE_LIST), // 大小 默认default
    children: PropTypes.node, // 子元素
    disabled: PropTypes.bool, // 是否禁用
    name: PropTypes.string, // 表单item名字
    className: PropTypes.string,
    vertical: PropTypes.bool, // 是否垂直展示
    radioItemClassName: PropTypes.string,
  };

  constructor(props) {
    super(props);

    // const checkedValue = this.props.defaultCheckedValue || this.props.checkedValue || null;
    const checkedValue =
      this.props.defaultCheckedValue !== undefined
        ? this.props.defaultCheckedValue
        : this.props.checkedValue !== undefined
          ? this.props.checkedValue
          : null;

    this.state = {
      data: formatData(checkedValue, this.props.data),
    };
  }

  componentDidMount() {
    if (this.props.needDefaultUpdate && typeof this.props.checkedValue !== 'undefined') {
      this.handleClick(this.props.checkedValue);
    }
  }

  componentWillReceiveProps(nextProps) {
    this.refreshId(nextProps.checkedValue, nextProps.data);
  }

  handleClick(value) {
    const { onChange } = this.props;

    this.refreshId(value, this.state.data);

    if (onChange) {
      onChange(value);
    }
  }

  refreshId(value, data) {
    this.setState({
      data: formatData(value, data),
    });
  }

  render() {
    const { className, vertical, style, radioItemClassName } = this.props;
    const cls = cx('ming RadioGroup', {
      [className]: !!className,
      'RadioGroup--vertical': vertical,
    });
    return (
      <div style={style} className={cls}>
        {this.state.data.map((item, index) => (
          <Radio
            {...this.props}
            {...item}
            className={radioItemClassName}
            onClick={(...arg) => this.handleClick(...arg)}
            key={index}
            disabled={this.props.disabled || item.disabled}
          />
        ))}
      </div>
    );
  }
}

export default RadioGroup;
