import React from 'react';
import styled from 'styled-components';
import { ColorPicker } from 'ming-ui';
import { replaceColor } from 'statistics/Charts/NumberChart';

const Wrap = styled.div`
  .ColorPickerPanelTrigger {
    background: transparent;
    padding: 0;
    border-radius: 0;
    box-shadow: none;
  }
`;

export default props => {
  const { themeColor, value, colorPickerRef, config, onChange } = props;
  const { bgColor = '#fff' } = config;
  const { iconColor } = replaceColor({ iconColor: bgColor }, {}, themeColor);
  return (
    <Wrap>
      <ColorPicker
        ref={colorPickerRef}
        notTrigger={true}
        sysColor={true}
        themeColor={themeColor}
        value={iconColor}
        onChange={color => {
          onChange({ bgStyleValue: value, bgColor: color });
        }}
      />
    </Wrap>
  );
};
