import PropTypes from 'prop-types';
import React, { Component } from 'react';
import cx from 'classnames';

import './style.less';

class Radio extends Component {
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
      // fire callback
      if (this.props.onChecked) {
        this.props.onChecked(event);
      }

      // update state.checked
      this.setState({
        checked: !this.state.checked,
      });
    }
  };

  render() {
    const classList = ['mui-radio'];
    const iconClassList = ['mui-radio-icon'];
    // checked
    if (this.state.checked) {
      classList.push('mui-radio-checked');
      iconClassList.push('ThemeAfterBGColor3');
    }
    // disabled
    if (this.props.disabled) {
      classList.push('mui-radio-disabled');
    }

    const classNames = classList.join(' ');
    const iconClassNames = iconClassList.join(' ');

    let label = null;
    if (this.props.label) {
      label = (
        <span className="mui-radio-label" title={this.props.label}>
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
        <span className={iconClassNames} />
        { this.props.color && <span className="colortag" style={{ backgroundColor: this.props.color }}></span> }
        {label}
      </div>
    );
  }
}

Radio.propTypes = {
  /**
   * 是否已选中
   */
  checked: PropTypes.bool,
  /**
   * 颜色
   */
  color: PropTypes.string,
  /**
   * 显示文字
   */
  label: PropTypes.string,
  /**
   * 是否禁用
   */
  disabled: PropTypes.bool,
  /**
   * 选中回调
   * @param {Event} event - 点击事件
   */
  onChecked: PropTypes.func,
  className: PropTypes.string,
  moduleType: PropTypes.string,
};

Radio.defaultProps = {
  checked: false,
  label: '',
  moduleType: '',
  disabled: false,
  onChecked: (event) => {
    //
  },
};

export default Radio;
