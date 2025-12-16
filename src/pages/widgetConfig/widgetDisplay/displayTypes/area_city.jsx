import React from 'react';
import { getAreaHintText } from 'src/pages/widgetConfig/util/setting';
import { CommonDisplay } from '../../styled';

export default function Area(props) {
  const { data } = props;
  const hintText = getAreaHintText(data);

  return (
    <CommonDisplay className="select">
      <span>{hintText}</span>
      <i className="icon-arrow-down-border"></i>
    </CommonDisplay>
  );
}
