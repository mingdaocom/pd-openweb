import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';

function Icon(props) {
  const { icon, className, style, type = 'default', ...otherProps } = props;
  let { fontClass, prefix } = props;
  if (!fontClass) {
    fontClass = 'icon';
  }
  if (!prefix) {
    prefix = fontClass + '-';
  }

  return <i {...otherProps} style={style} className={cx('ming Icon', `icon-${type}`, fontClass, prefix + icon, className)} title={props.hint} />;
}
Icon.propTypes = {
  icon: PropTypes.string,
  hint: PropTypes.string,
  fontClass: PropTypes.string,
  prefix: PropTypes.string,
  className: PropTypes.string,
};

export default Icon;
