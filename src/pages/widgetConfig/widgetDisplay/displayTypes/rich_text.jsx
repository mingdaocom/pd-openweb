import React from 'react';
import { CommonDisplay } from '../../styled';
import { getAdvanceSetting } from '../../util';

export default function RichText(props) {
  const minHeight = getAdvanceSetting(props.data, 'minheight') || 90;
  return <CommonDisplay height={minHeight - 2}></CommonDisplay>;
}
