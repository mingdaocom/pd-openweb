import PropTypes from 'prop-types';
import React, { Component } from 'react';
import InputBase from './InputBase';
import '../../less/InputFunc.less';

export default class InputFunc extends Component {
  static propTypes = {
    /**
     * 验证规则, 支持正则及自定义验证
     */
    validator: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    /**
     * 输入框的数量
     */
    iptNum: PropTypes.number,
    /**
     * 允许输入的字符长度
     */
    iptLength: PropTypes.number,
    /**
     * 分隔符
     */
    splitter: PropTypes.string,
    /**
     * 是否大写
     */
    uppercase: PropTypes.bool,
    /**
     * 值发生改变时的回调
     */
    onChange: PropTypes.func,
    /**
     * 输入框的宽度
     */
    inpWidth: PropTypes.number,
    /**
     * 默认值
     */
    defaultValue: PropTypes.string,
    readOnly: PropTypes.bool,
  };

  static defaultProps = {
    validator: '[0-9a-fxA-FX]',
    iptNum: 6,
    iptLength: 2,
    splitter: ':',
    inpWidth: 50,
    uppercase: false,
    onChange: () => {},
  };

  constructor(props) {
    super(props);
    const value = [];
    if ('defaultValue' in props) {
      for (let i = 1; i <= props.iptNum; i++) {
        value[i] = props.defaultValue.slice(props.iptLength * (i - 1), i * props.iptLength).split('');
      }
    }
    this.state = {
      value,
      activeIndex: 1,
    };
  }
  getInputs = () => {
    const inputs = [];
    const props = this.props;
    const state = this.state;
    const { iptNum, iptLength } = props;

    for (let i = 1; i <= iptNum; i++) {
      const divide = i === iptNum || iptNum === 1 ? null : <span className="Input-func-splitter">{props.splitter}</span>;
      const keys = state.value[i] ? state.value[i] : [];
      inputs.push(
        <span key={i} className="Input-func-item">
          <InputBase
            ref={ref => (this[`ipt${i}`] = ref)}
            index={i}
            keys={keys}
            iptLength={iptLength}
            readOnly={props.readOnly}
            validator={props.validator}
            inpWidth={props.inpWidth}
            uppercase={props.uppercase}
            onChange={this.handleChange}
            onPaste={this.handlePaste}
            onNextFocus={this.handleNextFocus}
            onPrevFocus={this.handlePrevFocus}
          />
          {divide}
        </span>
      );
    }
    return inputs;
  };
  // 聚焦下一个输入框
  handleNextFocus = (index) => {
    if (this[`ipt${index + 1}`]) {
      this[`ipt${index + 1}`]._ipt.focus();
    }
  };
  // 聚焦上一个输入框
  handlePrevFocus = (index) => {
    if (this[`ipt${index - 1}`]) {
      this[`ipt${index - 1}`]._ipt.focus();
    }
  };
  handleChange = (keys, index, type) => {
    const { iptLength } = this.props;
    if (type === 'input') {
      if (keys.length === iptLength) {
        this.handleNextFocus(index);
      }
    } else if (type === 'delete') {
      if (keys.length === 0) {
        this.handlePrevFocus(index);
      }
    }

    const newValue = this.state.value;
    newValue[index] = keys;
    const stringValue = newValue
      .filter(item => !!item)
      .map(val => val && val.join(''))
      .filter(item => !!item)
      .join('');

    this.setState({ value: newValue });
    this.props.onChange(stringValue);
  };
  handlePaste = (event, index) => {
    const value = this.state.value;
    const { iptNum, iptLength } = this.props;
    const data = event.clipboardData.getData('text').replace(/-|:/g, '');
    if (data && data.length) {
      for (let i = index; i <= iptNum; i++) {
        value[i] = data.slice(iptLength * (i - index), (i - index + 1) * iptLength).split('');
      }
      this.setState({ value });
      this.props.onChange(data);
    }
  };
  render() {
    return <div className="ming Input-func">{this.getInputs()}</div>;
  }
}
