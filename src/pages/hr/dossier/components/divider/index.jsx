import PropTypes from 'prop-types';
import React, { Component } from 'react';
import cx from 'classnames';
import './style.less';

class Divider extends Component {
  render() {
    let label = '';
    if (this.props.label && this.props.label.length) {
      label = this.props.label;
    }

    return <div className={cx('mui-divider', { 'mui-divider-null': !label })}>{_l(label)}<div className="mui-divider-clear-line" /></div>;
  }
}

Divider.propTypes = {
  /**
   * 显示文本
   */
  label: PropTypes.string,
};

Divider.defaultProps = {
  label: '',
};

export default Divider;
