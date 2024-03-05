import React, { useState, useEffect } from 'react';
import { string } from 'prop-types';
import { CommonDisplay } from '../../styled';

export default function Area(props) {
  return (
    <CommonDisplay className="select">
      <span>{_l('请选择')}</span>
      <i className="icon-arrow-down-border"></i>
    </CommonDisplay>
  );
}
