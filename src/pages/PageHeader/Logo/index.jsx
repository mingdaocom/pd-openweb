import React, { Component } from 'react';
import cx from 'classnames';
import { navigateTo } from 'src/router/navigateTo';
import './index.less';

export default ({ className, href = '/' }) => (
  <div className={cx(className, 'logoWrap')} onClick={() => navigateTo(href)}>
    <img src={md.global.Config.Logo} alt="logo" />
  </div>
);
