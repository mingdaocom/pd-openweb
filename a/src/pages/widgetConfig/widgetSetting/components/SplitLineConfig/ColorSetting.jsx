import React from 'react';
import { ColorPicker } from 'ming-ui';
import styled from 'styled-components';
import _ from 'lodash';

const ColorBox = styled.div`
  width: 100px;
  height: 32px;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 3px;
  cursor: pointer;
  padding: 4px;
  box-sizing: border-box;
  display: flex;
  .boxBg {
    flex: 1;
    border-radius: 3px;
    background: ${props => props.background};
  }
  .iconBox {
    padding: 4px;
    line-height: 15px;
    color: rgb(177, 177, 177);
    font-size: 14px;
    margin-left: 5px;
    border-radius: 3px;
    &:hover {
      background: #f5f5f5;
    }
  }
`;

export default function ColorSetting(props) {
  const { defaultValue, value, onChange } = props;

  return (
    <ColorPicker
      popupAlign={{
        points: ['tl', 'bl'],
        offset: [-260, 3],
      }}
      sysColor
      isPopupBody
      value={value}
      onChange={value => onChange(value)}
    >
      <ColorBox background={value}>
        <div className="boxBg"></div>
        {value && value.toLowerCase().includes(defaultValue) ? (
          <span className="icon-arrow-down-border iconBox"></span>
        ) : (
          <span
            className="iconBox icon-replay"
            onClick={e => {
              e.stopPropagation();
              onChange(defaultValue);
            }}
          ></span>
        )}
      </ColorBox>
    </ColorPicker>
  );
}
