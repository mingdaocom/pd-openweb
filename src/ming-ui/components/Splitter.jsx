import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import './less/Splitter.less';

function Splitter(props) {
  return <hr {...props} className={cx(props.className, 'ming Splitter')} />;
}
Splitter.propTypes = {
  /**
   * 分割线的类名
   */
  className: PropTypes.string,
};

export default Splitter;
