import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';

class Tab extends React.Component {
  static propTypes = {
    focused: PropTypes.bool,
    className: PropTypes.string,
    children: PropTypes.any,
    setRef: PropTypes.func,
  };

  render() {
    const { focused, className, children, setRef, ...rest } = this.props;
    return (
      <li {...rest} ref={setRef} className={cx('InlineBlock', { 'current colorPrimary': focused }, className)}>
        {children}
      </li>
    );
  }
}

export default Tab;
