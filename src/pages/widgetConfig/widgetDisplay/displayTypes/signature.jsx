import React, { useState, useEffect } from 'react';
import { string } from 'prop-types';
import { CommonDisplay } from '../../styled';

export default function Signature(props) {
  return (
    <CommonDisplay>
      <div className="intro">
        <i className="icon-e-signature"></i>
        <span>{_l('添加签名')}</span>
      </div>
    </CommonDisplay>
  );
}
