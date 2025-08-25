import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { isLightColor } from 'src/utils/control';

const Wrap = styled.span`
  padding: 5px 8px;
  border-radius: 18px;
`;

export default function (props) {
  let style = {};
  const data = props.controlInfo.options.find(o => o.key === props.item) || {};
  if (_.get(props, 'controlInfo.enumDefault2') === 1) {
    const fontColor = !isLightColor(data.color) ? '#fff' : '#151515';
    style = { background: data.color, color: fontColor };
  }
  return (
    <Wrap style={style} className="Font13">
      {data.isDeleted ? _l('已删除') : data.value}
    </Wrap>
  );
}
