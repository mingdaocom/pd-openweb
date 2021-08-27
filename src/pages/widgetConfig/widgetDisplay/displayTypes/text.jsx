import React, { useState, useEffect } from 'react';
import { string } from 'prop-types';
import { CommonDisplay } from '../../styled';

export default function Text({ data }) {
  const { hint, enumDefault } = data;

  return (
    <CommonDisplay style={enumDefault === 1 ? { height: '90px', alignItems: 'baseline' } : {}}>
      <div className="hint overflow_ellipsis">{hint}</div>
    </CommonDisplay>
  );
}
