import PropTypes from 'prop-types';
import React, { Component } from 'react';

import './style.less';

import Icon from 'ming-ui/components/Icon';

class Button extends Component {
  onClick = (event) => {
    // fire callback
    if (!this.props.disabled && this.props.onClick) {
      this.props.onClick(event);
    }
  };

  render() {
    const classList = ['mui-button', 'ThemeBGColor3', 'ThemeHoverBGColor2'];
    // type
    if (this.props.type === 'ghost') {
      classList.push('mui-button-ghost');
      classList.push('ThemeBorderColor3');
      classList.push('ThemeColor3');
      classList.push('ThemeHoverBorderColor2');
    }
    // color
    if (this.props.color === 'error') {
      classList.push('mui-button-error');
    }

    const classNames = classList.join(' ');

    let icon = null;
    if (this.props.icon) {
      icon = <Icon icon={this.props.icon} />;
    }

    return (
      <button
        type="button"
        className={classNames}
        disabled={this.props.disabled}
        onClick={(event) => {
          this.onClick(event);
        }}
      >
        {icon}
        <span className="mui-button-label">{this.props.label}</span>
      </button>
    );
  }
}

Button.propTypes = {
  /**
   * 按钮类型
   */
  type: PropTypes.oneOf([
    /**
     * 默认
     */
    'default',
    /**
     * 带边框
     */
    'ghost',
  ]),
  /**
   * 按钮颜色
   */
  color: PropTypes.oneOf([
    /**
     * 默认
     */
    'default',
    /**
     * 错误
     */
    'error',
  ]),
  /**
   * 按钮图标
   */
  icon: PropTypes.string,
  /**
   * 按钮文本
   */
  label: PropTypes.string,
  /**
   * 是否禁用
   */
  disabled: PropTypes.bool,
  /**
   * 点击回调
   * @param {Event} event - 点击事件
   */
  onClick: PropTypes.func,
};

Button.defaultProps = {
  type: 'default',
  icon: '',
  label: '',
  disabled: false,
  onClick: (event) => {
    //
  },
};

export default Button;
