import React from 'react';
import { CommonDisplay } from '../../styled';

export default function Area() {
  return (
    <CommonDisplay className="select">
      <span>{_l('请选择')}</span>
      <i className="icon-arrow-down-border"></i>
    </CommonDisplay>
  );
}
