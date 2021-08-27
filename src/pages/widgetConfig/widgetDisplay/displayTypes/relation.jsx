import React, { useState, useEffect } from 'react';
import { string } from 'prop-types';
import { CommonDisplay } from '../../styled';

export default function Relation(props) {
  return (
    <CommonDisplay>
      <div className="intro">
        <i className="icon-add"></i>
        <span>{_l('自由连接')}</span>
      </div>
    </CommonDisplay>
  );
}
