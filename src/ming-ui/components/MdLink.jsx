import React from 'react';
import { Link } from 'react-router-dom';
import cx from 'classnames';
import propTypes from 'prop-types';
import { pathCompletion } from 'src/utils/common';

export default function MdLink(props) {
  const { to, children, onClick, className, ...rest } = props;
  return (
    <Link
      draggable="false"
      to={pathCompletion(to, { hasDomain: false })}
      onClick={onClick}
      className={cx('stopPropagation', className)}
      {...rest}
    >
      {children}
    </Link>
  );
}

MdLink.propTypes = {
  to: propTypes.string,
  children: propTypes.any,
  onClick: propTypes.func,
};
