import React from 'react';
import { ColorPicker } from 'ming-ui';
import { replaceColor } from 'statistics/Charts/NumberChart';

export default props => {
  const { themeColor, value, colorPickerRef, config, onChange } = props;
  const { bgColor = '#fff' } = config;
  const { iconColor } = replaceColor({ iconColor: bgColor }, {}, themeColor);
  return (
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
  );
};
