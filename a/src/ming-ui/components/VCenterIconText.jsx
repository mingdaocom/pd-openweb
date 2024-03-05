import React from 'react';
import { string, number, shape } from 'prop-types';
import styled from 'styled-components';

const Con = styled.div`
  display: inline-flex;
  justify-content: center;
  align-items: center;
`;

export default function VCenterIconText(props) {
  const {
    icon,
    text,
    iconSize = 20,
    textSize = 14,
    textLeft = 6,
    iconStyle = {},
    textStyle = {},
    afterElement,
    ...rest
  } = props;
  return (
    <Con {...rest}>
      {icon && (
        <i
          className={`frontIcon icon icon-${icon}`}
          style={{ fontSize: iconSize, marginRight: textLeft, ...iconStyle }}
        ></i>
      )}
      {text && (
        <span className="text" style={{ fontSize: textSize, ...textStyle }}>
          {text}
        </span>
      )}
      {!!afterElement && afterElement}
    </Con>
  );
}

VCenterIconText.propTypes = {
  iconStyle: shape({}),
  textStyle: shape({}),
  iconSize: number,
  textSize: number,
  textLeft: number,
  icon: string,
  text: string,
};
