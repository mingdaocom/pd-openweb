import PropTypes from 'prop-types';
import React, { Component } from 'react';
import cx from 'classnames';

import './style.less';

import Icon from 'ming-ui/components/Icon';

class CheckBox extends Component {
  constructor(props) {
    super(props);

    this.state = {
      /**
       * 是否已选中
       */
      checked: this.props.checked || false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.checked !== this.state.checked) {
      // apply props.checked update
      this.setState({
        checked: nextProps.checked,
      });
    }
  }

  onClick = (event) => {
    if (!this.props.disabled) {
      const checked = !this.state.checked;
      // fire callback
      if (this.props.onChange) {
        this.props.onChange(event, checked);
      }

      // update state.checked
      this.setState({
        checked,
      });
    }
  };

  render() {
    const classList = ['mui-checkbox'];
    const iconClassList = ['mui-checkbox-icon'];

    let icon = 'ok';
    // 半选中
    if (this.props.intermediate) {
      icon = 'minus';
    }

    // checked
    if (this.state.checked) {
      classList.push('mui-checkbox-checked');
      if (!this.props.disabled) {
        iconClassList.push('ThemeBeforeBGColor3');
        iconClassList.push('ThemeBeforeBorderColor3');
      }
    }
    // disabled
    if (this.props.disabled) {
      classList.push('mui-checkbox-disabled');
    }

    const classNames = classList.join(' ');
    const iconClassNames = iconClassList.join(' ');

    let label = null;
    if (this.props.label) {
      label = (
        <span className="mui-checkbox-label" title={this.props.label}>
          {this.props.label}
        </span>
      );
    }

    return (
      <div
        className={cx(classNames, this.props.className)}
        onClick={(event) => {
          this.onClick(event);
        }}
      >
        <span className={cx(iconClassNames)}>
          <Icon icon={icon} />
        </span>
        { this.props.color && <span className="colortag" style={{ backgroundColor: this.props.color }}></span> }
        {label}
      </div>
    );
  }
}

CheckBox.propTypes = {
  /**
   * 是否已选中
   */
  checked: PropTypes.bool,
  /**
   * 显示文字
   */
  label: PropTypes.string,
  /**
   * 是否禁用
   */
  disabled: PropTypes.bool,
  /**
   * 选中切换回调
   * @param {Event} event - 点击事件
   * @param {Bool} checked - 是否选中
   */
  onChange: PropTypes.func,
  /**
   * 半选中
   */
  intermediate: PropTypes.bool,
  className: PropTypes.string,
};

CheckBox.defaultProps = {
  checked: false,
  label: '',
  disabled: false,
  onChange: (event) => {
    //
  },
};

export default CheckBox;
