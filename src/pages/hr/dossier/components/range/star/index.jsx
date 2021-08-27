import PropTypes from 'prop-types';
import React, { Component } from 'react';

import './style.less';

class Star extends Component {
  onMouseEnter = (event) => {
    if (this.props.onMouseEnter && !this.props.disabled) {
      this.props.onMouseEnter(event);
    }
  };

  onMouseLeave = (event) => {
    if (this.props.onMouseLeave && !this.props.disabled) {
      this.props.onMouseLeave(event);
    }
  };

  onClick = (event) => {
    if (this.props.onClick && !this.props.disabled) {
      this.props.onClick(event);
    }
  };

  render() {
    const icon = this.props.checked ? <i className="icon-task_custom_starred" /> : <i className="icon-task_custom_starred-gray" />;

    const classList = ['mui-range-star', 'tip-top'];
    if (this.props.checked) {
      classList.push('checked');
    }
    if (this.props.disabled) {
      classList.push('disabled');
    }
    const classNames = classList.join(' ');

    let other = {};
    if (!this.props.disabled) {
      other = {
        'data-tip': this.props.label,
      };
    }

    return (
      <div
        className={classNames}
        {...other}
        onMouseEnter={(event) => {
          this.onMouseEnter(event);
        }}
        onMouseLeave={(event) => {
          this.onMouseLeave(event);
        }}
        onClick={(event) => {
          this.onClick(event);
        }}
      >
        {icon}
      </div>
    );
  }
}

Star.propTypes = {
  /**
   * 是否选中
   */
  checked: PropTypes.bool,
  /**
   * 标签
   */
  label: PropTypes.string,
  /**
   * 是否禁用
   */
  disabled: PropTypes.bool,
  /**
   * onMouseEnter
   */
  onMouseEnter: PropTypes.func,
  /**
   * onMouseLeave
   */
  onMouseLeave: PropTypes.func,
  /**
   * onClick
   */
  onClick: PropTypes.func,
};

Star.defaultProps = {
  checked: false,
  label: '',
  disabled: false,
  onMouseEnter: (event) => {
    //
  },
  onMouseLeave: (event) => {
    //
  },
  onClick: (event) => {
    //
  },
};

export default Star;
