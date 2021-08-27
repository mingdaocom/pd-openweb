import React, { Component } from 'react';
import { string } from 'prop-types';
import './index.less';
import MyAppSide from './MyAppSide';
import MyAppGroup from './MyAppGroup';

export default () => (
  <div className="myAppWrap">
    <MyAppSide />
    <MyAppGroup />
  </div>
);
