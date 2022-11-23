import PropTypes from 'prop-types';
import React, { Component } from 'react';
import cx from 'classnames';
import { default as Radio, SIZE_LIST } from './Radio';

export { Radio, SIZE_LIST };

class RadioGroup2 extends Component {
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
    const checkedValue = this.props.defaultCheckedValue || this.props.checkedValue || '';
    this.state = {
      data: this.props.data || [],
    };
  }

  componentDidMount() {
    if (typeof this.props.checkedValue !== 'undefined') {
      this.handleClick(this.props.checkedValue);
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.data,
    });
  }

  handleClick(value) {
    this.props.onChange(value);
    this.setState({
      data: this.state.data.map(item =>
        Object.assign(item, {
          checked: item.value === value,
        }),
      ),
    });
  }

  render() {
    const { vertical, radioItemClassName } = this.props;
    return (
      <div className={`ming RadioGroup2 ${this.props.className || ''}`}>
        <div className={cx('RadioGroupCon', { flexColumn: vertical })}>
          {this.state.data.map((item, index) => (
            <Radio
              {...item}
              className={radioItemClassName}
              onClick={(...arg) => this.handleClick(...arg)}
              key={index}
              size={this.props.size}
              disabled={this.props.disabled}
            />
          ))}
        </div>
      </div>
    );
  }
}

export default RadioGroup2;
