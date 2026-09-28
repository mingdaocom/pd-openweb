import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';

const Icon = React.forwardRef(function Icon(props, ref) {
  const { icon, className, style, type = 'default', ...otherProps } = props;
  let { fontClass, prefix } = props;

  if (!fontClass) {
    fontClass = 'icon';
  }

  if (!prefix) {
    prefix = fontClass + '-';
  }

  return (
    <i
      {...otherProps}
      ref={ref}
      style={style}
      className={cx('ming Icon', `icon-${type}`, fontClass, prefix + icon, className)}
      title={props.hint}
    />
  );
});

Icon.propTypes = {
  icon: PropTypes.string,
  hint: PropTypes.string,
  fontClass: PropTypes.string,
  prefix: PropTypes.string,
  className: PropTypes.string,
};

export default Icon;
