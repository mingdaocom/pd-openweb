import React from 'react';
import PropTypes from 'prop-types';

import '../less/Divider.less';

export default class Divider extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    style: PropTypes.object,
  };

  static defaultProps = {
    // To fix keyboard UX.
    disabled: true,
    className: '',
    style: {},
  };

  render() {
    const { className, style } = this.props;
    return <li className={`${className} ming Divider`} style={style} />;
  }
}
