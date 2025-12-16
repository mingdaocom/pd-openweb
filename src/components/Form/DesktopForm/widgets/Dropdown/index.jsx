import React from 'react';
import { Steps } from 'ming-ui';
import Dropdown from './dropdown';

const DropdownWidgets = props => {
  const {
    disabled,
    advancedSetting: { showtype, direction } = {},
    value,
    options = [],
    enumDefault2,
    onChange = () => {},
  } = props;

  if (showtype === '2') {
    return (
      <Steps
        from="recordInfo"
        direction={direction}
        value={JSON.parse(value || '[]')[0]}
        disabled={disabled}
        data={{ options, enumDefault2 }}
        onChange={value => {
          onChange(JSON.stringify(value ? [value] : []));
        }}
      />
    );
  }

  return <Dropdown {...props} />;
};

export default DropdownWidgets;
