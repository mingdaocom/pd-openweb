import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

class Tab extends React.Component {
  // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    focused: PropTypes.bool,
    className: PropTypes.string,
    children: PropTypes.any,
  };

  render() {
    const { focused, className, children, ...rest } = this.props;
    return (
      <li {...rest} className={cx('InlineBlock ThemeBorderColor4', { 'current ThemeColor3': focused }, className)}>
        {children}
      </li>
    );
  }
}

export default Tab;
