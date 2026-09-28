import React, { forwardRef } from 'react';
import ConfigProvider from 'antd/es/config-provider';
import AntSwitch from 'antd/es/switch';

const MINI_SWITCH_THEME = {
  components: {
    Switch: {
      trackHeightSM: 16,
      trackMinWidthSM: 28,
      handleSizeSM: 12,
      innerMinMarginSM: 6,
      innerMaxMarginSM: 18,
    },
  },
};

const Switch = forwardRef(({ size, ...props }, ref) => {
  if (size !== 'mini') {
    return <AntSwitch {...props} ref={ref} size={size} />;
  }

  return (
    <ConfigProvider theme={MINI_SWITCH_THEME}>
      <AntSwitch {...props} ref={ref} size="small" />
    </ConfigProvider>
  );
});

Switch.displayName = 'Switch';
Switch.__ANT_SWITCH = AntSwitch.__ANT_SWITCH;

export default Switch;
