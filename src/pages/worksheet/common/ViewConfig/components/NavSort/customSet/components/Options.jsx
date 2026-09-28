import React from 'react';
import _ from 'lodash';
import { isLightColor } from 'src/utils/domain/control/style';

export default function (props) {
  let style = {};
  const data = props.controlInfo.options.find(o => o.key === props.item) || {};

  if (_.get(props, 'controlInfo.enumDefault2') === 1) {
    const fontColor = !isLightColor(data.color) ? '#fff' : 'var(--color-text-title)';
    style = { background: data.color, color: fontColor };
  }

  return (
    <span
      style={style}
      className="InlineBlock LineHeight24 boderRadAll_50 TxtMiddle borderBox wMax100 Font13 pLeft8 pRight8 ellipsis"
    >
      {data.isDeleted ? _l('已删除') : data.value}
    </span>
  );
}
