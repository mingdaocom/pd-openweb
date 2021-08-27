import React from 'react';
import PropTypes from 'prop-types';
import './index.less';
import cx from 'classnames'

export default class TableEmpty extends React.Component {
  static propTypes = {
    detail: PropTypes.object,
  };

  render() {
    const { icon, desc } = this.props.detail
    return (
      <div className="tableEmptyBox">
        <div className="emptyIcon">
          <span className={cx('Font40', icon)} />
        </div>
        <span className="Bold Font15 mTop20 desc">{desc}</span>
      </div>
    );
  }
}
