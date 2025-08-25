import React from 'react';
import { CommonDisplay } from '../../styled';

export default function Signature() {
  return (
    <CommonDisplay>
      <div className="intro">
        <i className="icon-e-signature"></i>
        <span>{_l('添加签名')}</span>
      </div>
    </CommonDisplay>
  );
}
