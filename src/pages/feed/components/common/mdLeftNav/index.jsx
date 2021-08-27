import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import './mdLeftNav.css';

function MDLeftNav(props) {
  return <div className={cx('fixedContainer mdLeftNav clearfix', props.className)}>{props.children}</div>;
}
MDLeftNav.propTypes = {
  className: PropTypes.string,
  children: PropTypes.any,
};

module.exports = MDLeftNav;
