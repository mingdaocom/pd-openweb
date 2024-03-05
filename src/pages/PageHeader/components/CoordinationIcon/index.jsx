import React from 'react';
import './index.less';
import cx from 'classnames';

export default ({ className }) => (
  <div className={cx('coordinationIcon', className)}>
    <div className="colorItem" />
    <div className="colorItem" />
    <div className="colorItem" />
    <div className="colorItem" />
    <div className="halfCircleItem" />
    <div className="halfCircleItem" />
    <div className="halfCircleItem" />
    <div className="halfCircleItem" />
  </div>
);
