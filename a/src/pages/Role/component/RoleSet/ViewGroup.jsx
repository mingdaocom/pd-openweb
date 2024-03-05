import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
export default class ViewGroup extends PureComponent {
  static propTypes = {
    hasViews: PropTypes.bool,
    className: PropTypes.string,
    children: PropTypes.any,
  };

  componentWillEnter(callback) {
    const { hasViews } = this.props;
    if (this.list && hasViews) {
      $(this.list)
        .stop()
        .slideDown(300, callback);
    }
  }

  componentWillLeave(callback) {
    const { hasViews } = this.props;
    if (this.list && hasViews) {
      $(this.list)
        .stop()
        .slideUp(300, callback);
    }
  }

  render() {
    const { className } = this.props;
    return (
      <div
        ref={el => {
          this.list = el;
        }}
        className={cx('Hidden', className)}
      >
        {this.props.children}
      </div>
    );
  }
}
