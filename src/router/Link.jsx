import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import classNames from 'classnames';

import { clearZombie, urlStack } from './navigateTo';

function MingDaoLink(props) {
  const linkProps = {
    ...props,
    className: classNames(props.className, 'DisableInterceptClick'),
    onClick: event => {
      clearZombie();
      if (props.replace && urlStack.length) {
        urlStack.splice(urlStack.length - 1, 1, String(props.to));
      } else {
        urlStack.push(String(props.to));
      }
      if (_.isFunction(props.onClick)) {
        props.onClick(event);
      }
    },
  };
  return <Link {...linkProps} />;
}

MingDaoLink.propTypes = {
  className: PropTypes.string,
  to: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({})]),
  replace: PropTypes.bool,
  onClick: PropTypes.func,
};

export default MingDaoLink;
