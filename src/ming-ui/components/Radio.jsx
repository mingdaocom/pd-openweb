import PropTypes from 'prop-types';
import React, { Component } from 'react';
import cx from 'classnames';
import './less/RadioGroup.less';
import { includes, isFunction } from 'lodash';

export const SIZE_LIST = ['small', 'default', 'middle'];

class Radio extends Component {
  static propTypes = {
    /**
     * Raio显示的名称
     */
    text: PropTypes.any,
    /**
     * 在回调中作为第二个参数返回
     */
    value: PropTypes.any,
    /**
     * 选中
     */
    checked: PropTypes.bool,
    /**
     * 默认选中
     */
    defaultChecked: PropTypes.bool,
    /**
     * 点击
     */
    onClick: PropTypes.func,
    /**
     * 是否禁用
     */
    disabled: PropTypes.bool,
    /**
     * 子节点
     */
    children: PropTypes.any,
    /**
     * 尺寸大小
     */
    size: PropTypes.oneOf(SIZE_LIST),
    /**
     * 类名
     */
    className: PropTypes.string,
    /**
     * 不显示 title
     */
    disableTitle: PropTypes.bool,
  };

  state = {
    checked: this.props.checked || this.props.defaultChecked,
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      checked: nextProps.checked,
    });
  }

  handleClick = () => {
    const { onClick, value, disabled } = this.props;
    if (disabled) return;
    if (isFunction(onClick)) {
      onClick(value);
    }
  };

  render() {
    const { checked } = this.state;
    const { disabled, className, size, icon, text, children, title, disableTitle } = this.props;

    return (
      <label
        checked={checked}
        className={cx('ming Radio', { 'Radio--disabled': disabled, checked }, className)}
        onClick={this.handleClick}
        title={!disableTitle && (title || text)}>
        <span className={cx(SIZE_LIST.includes(size) ? 'Radio-box--' + size : '', 'Radio-box')}>
          <span className="Radio-box-round" />
        </span>
        <span className="Radio-text">
          {icon && <i className={cx('icon', icon)} />}
          {text}
          {children}
        </span>
      </label>
    );
  }
}

export default Radio;
