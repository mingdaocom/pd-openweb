import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import './mdLeftNav.css';

function MDLeftNav(props) {
  return <div className={cx('Fixed mdLeftNav clearfix', props.className)}>{props.children}</div>;
}
MDLeftNav.propTypes = {
  className: PropTypes.string,
  children: PropTypes.any,
};

export default MDLeftNav;
