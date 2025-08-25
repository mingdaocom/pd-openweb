import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';

class Tab extends React.Component {
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
