import React from 'react';
import cx from 'classnames';
import './index.less';

export default ({ className, ...rest }) => (
  <div className={cx('homepageIcon')} {...rest}>
    <div className="item" />
    <div className="item" />
    <div className="item" />
    <div className="item" />
    <div className="item" />
    <div className="item" />
    <div className="item" />
    <div className="item" />
    <div className="item" />
  </div>
);
