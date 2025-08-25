import React from 'react';
import { Link } from 'react-router-dom';
import cx from 'classnames';
import propTypes from 'prop-types';
import { fillUrl } from 'src/router/navigateTo';

export default function MdLink(props) {
  const { to, children, onClick, className, ...rest } = props;
  return (
    <Link draggable="false" to={fillUrl(to)} onClick={onClick} className={cx('stopPropagation', className)} {...rest}>
      {children}
    </Link>
  );
}

MdLink.propTypes = {
  to: propTypes.string,
  children: propTypes.any,
  onClick: propTypes.func,
};
