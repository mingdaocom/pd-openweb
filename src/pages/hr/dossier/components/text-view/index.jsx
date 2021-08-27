import PropTypes from 'prop-types';
import React, { Component } from 'react';

import './style.less';

class TextView extends Component {
  render() {
    const content = this.props.value ? `${this.props.prefix}${this.props.value}${this.props.suffix}` : '';

    return <div className="mui-textview Gray_75 WordBreak" dangerouslySetInnerHTML={{ __html: content.replace(/[\r\n]/g, '<br />') }} />;
  }
}

TextView.propTypes = {
  /**
   * 当前选中的值
   */
  value: PropTypes.string,
  /**
   * 前缀
   */
  prefix: PropTypes.string,
  /**
   * 后缀
   */
  suffix: PropTypes.string,
};

TextView.defaultProps = {
  value: '',
  prefix: '',
  suffix: '',
};

export default TextView;
