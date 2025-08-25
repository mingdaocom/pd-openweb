import React from 'react';
import cx from 'classnames';
import './index.less';

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
