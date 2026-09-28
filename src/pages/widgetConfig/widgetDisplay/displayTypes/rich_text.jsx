import React from 'react';
import { getAdvanceSetting } from 'src/utils/domain/control/advancedSetting';
import { CommonDisplay } from '../../styled';

export default function RichText(props) {
  const minHeight = getAdvanceSetting(props.data, 'minheight') || 90;
  return <CommonDisplay $height={minHeight - 2}></CommonDisplay>;
}
