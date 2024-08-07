import React from 'react';
import propTypes from 'prop-types';
import { fillUrl } from 'src/router/navigateTo';
import { Link } from 'react-router-dom';
import _ from 'lodash';

export default function MdLink(props) {
  const { to, children, onClick, ...rest } = props;
  return (
    <Link draggable="false" to={fillUrl(to)} onClick={onClick} {...rest}>
      {children}
    </Link>
  );
}

MdLink.propTypes = {
  to: propTypes.string,
  children: propTypes.any,
  onClick: propTypes.func,
};
