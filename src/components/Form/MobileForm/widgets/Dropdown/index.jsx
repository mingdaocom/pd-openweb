import React, { memo } from 'react';
import Dropdown from './dropdown';
import { Steps } from 'ming-ui';

const DropdownWidget = props => {
  const { disabled, advancedSetting = {}, value, options = [], enumDefault2 } = props;
  const { showtype, direction } = advancedSetting;

  if (showtype === '2') {
    return (
      <Steps
        from="recordInfo"
        direction={direction}
        value={JSON.parse(value || '[]')[0]}
        disabled={disabled}
        data={{ options, enumDefault2 }}
        onChange={value => {
          props.onChange(JSON.stringify(value ? [value] : []));
        }}
      />
    );
  }

  return <Dropdown {...props} />;
};

export default memo(DropdownWidget);
